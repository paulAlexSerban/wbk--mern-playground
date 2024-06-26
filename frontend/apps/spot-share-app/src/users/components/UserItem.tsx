import { FC } from 'react';
import './UserItem.scss';
import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import { Link } from 'react-router-dom';

type UserItemProps = {
    image: string;
    name: string;
    id: string;
    placeCount: number;
};

const ASSET_URL = import.meta.env.VITE_APP_ASSET_URL as string;

const UserItem: FC<UserItemProps> = ({ image, name, placeCount, id, ...props }) => {
    return (
        <li className="user-item" {...props}>
            <Card className="user-item__content">
                <Link to={`/${id}/places`}>
                    <div className="user-item__image">
                        <Avatar
                            image={`${ASSET_URL}/${image}`}
                            alt={name}
                            width="60px"
                            className="avatar"
                            style={{ width: '60px', height: '60px' }}
                        />
                    </div>
                    <div className="user-item__info">
                        <h2>{name}</h2>
                        <h3>
                            {placeCount} {placeCount === 1 ? 'Place' : 'Places'}
                        </h3>
                    </div>
                </Link>
            </Card>
        </li>
    );
};

export default UserItem;
