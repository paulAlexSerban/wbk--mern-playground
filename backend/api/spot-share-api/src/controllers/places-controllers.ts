import { Controller, ExtendedController } from './.types';
import HttpError from '../models/HttpError';
import { validationResult } from 'express-validator';
import { getCoordsForAddress } from '../utils/location';
import PlaceSchema from '../models/PlaceSchema';
import UserSchema from '../models/UserSchema';
import mongoose from 'mongoose';
import fs from 'fs';

const getPlaceById: Controller = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    try {
        place = await PlaceSchema.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find places for the provided user id.', 404);
        return next(error);
    }

    return res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId: Controller = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    let userWithPlaces;
    try {
        places = await PlaceSchema.find({ creator: userId });
        // with populate we get access to the corresponding places the user has
        userWithPlaces = await UserSchema.findById(userId).populate('places');
        console.log(userWithPlaces);
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again later.', 500);
        return next(error);
    }

    if (!places || places.length === 0) {
        return next(new HttpError('Could not find places for the provided user id.', 404));
    }

    return res.status(200).json({ places: places.map((place) => place.toObject({ getters: true })) });
};

const createNewPlace: ExtendedController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }
    const { title, description, address } = req.body;

    /**
     * Authorization check
     * If the user is not the creator of the place, they are not allowed to create it.
     */
    if (!req.userData) {
        const error = new HttpError('You are not allowed to create a place for this user.', 401);
        return next(error);
    }
    // The user id is stored in the token
    const authorizedCreator = req.userData.userId;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }
    if (!req.file) {
        const error = new HttpError('Image file is required.', 422);
        return next(error);
    }

    const filePath = req.file.path.replace(/^dist\/src\/public\//, '');
    const createdPlace = new PlaceSchema({
        title,
        description,
        imageUrl: filePath, // 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg
        address,
        location: coordinates,
        creator: authorizedCreator,
    });

    let user;
    try {
        user = await UserSchema.findById(authorizedCreator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace._id);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    return res.status(201).json({ place: createdPlace });
};

const updatePlaceById: ExtendedController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }
    const placeId = req.params.pid;
    const { title, description } = req.body;
    let place;
    try {
        place = await PlaceSchema.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }
    if (!place) {
        const error = new HttpError('Could not find place for the provided id.', 404);
        return next(error);
    }

    /**
     * Authorization check
     * If the user is not the creator of the place, they are not allowed to edit it.
     */
    if (!req.userData) {
        const error = new HttpError('You are not allowed to create a place for this user.', 401);
        return next(error);
    }
    if (req.userData && place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place.', 401);
        return next(error);
    }

    place.title = title;
    place.description = description;
    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }
    return res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById: ExtendedController = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        // this will also delete the place from the user's places array
        // it works because of the 'ref' in the PlaceSchema model and the 'ref' in the UserSchema model
        // it will
        place = await PlaceSchema.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }
    if (!place) {
        const error = new HttpError('Could not find place for the provided id.', 404);
        return next(error);
    }

    /**
     * Authorization check
     * If the user is not the creator of the place, they are not allowed to delete it.
     */
    if (!req.userData) {
        const error = new HttpError('You are not allowed to create a place for this user.', 401);
        return next(error);
    }
    if (req.userData && place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to delete this place.', 401);
        return next(error);
    }

    const imagePath = place.imageUrl;
    const localImagePath = 'dist/src/public/' + imagePath;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await PlaceSchema.deleteOne({ _id: placeId }, { session: sess });
        const user = await UserSchema.findById(place.creator);
        if (user) {
            // Pull the place from the user's places array
            user.places.pull(placeId);
            await user.save({ session: sess });
        } else {
            const error = new HttpError('Could not find user for this place.', 404);
            return next(error);
        }

        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    fs.unlink(localImagePath, (err) => {
        if (err) {
            console.error(err);
        }
    });
    return res.status(200).json({ message: 'Deleted place.' });
};

export { getPlaceById, getPlacesByUserId, createNewPlace, updatePlaceById, deletePlaceById };
