import { FormEvent, useState, useContext } from 'react';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './Auth.scss';

const Auth = () => {
    const auth = useContext(AuthContext);
    const { login } = auth;
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);
    const [formState, inputHandler, setFormData] = useForm(
        {
            email: {
                value: '',
                isValid: false,
            },
            password: {
                value: '',
                isValid: false,
            },
        },
        false
    );

    const authSubmitHandler = async (event: FormEvent) => {
        event.preventDefault();

        if (isLogin) {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:3000/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value,
                    }),
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message);
                } else {
                    console.log(responseData);
                    setIsLoading(false);
                    login();
                }
            } catch (err) {
                const error = err as Error;
                setError(error.message || 'Something went wrong, please try again.');
                setIsLoading(false);
            }
        } else {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:3000/api/users/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formState.inputs.name.value,
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value,
                    }),
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message);
                } else {
                    console.log(responseData);
                    setIsLoading(false);
                    login();
                }
            } catch (err) {
                const error = err as Error;
                setError(error.message || 'Something went wrong, please try again.');
                setIsLoading(false);
            }
        }
    };

    const switchModeHandler = () => {
        if (!isLogin) {
            const { name, ...rest } = formState.inputs; // Destructure to exclude 'name'
            setFormData(
                rest, // Pass the remaining inputs
                formState.inputs.email.isValid && formState.inputs.password.isValid
            );
        } else {
            setFormData(
                {
                    ...formState.inputs,
                    name: {
                        value: '',
                        isValid: false,
                    },
                },
                false
            );
        }
        setIsLogin((prevMode) => !prevMode);
    };

    return (
        <>
            {error && <ErrorModal error={error} onClear={() => setError(null)} />}
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <hr />
                <form onSubmit={authSubmitHandler}>
                    {!isLogin && (
                        <Input
                            element="input"
                            id="name"
                            type="text"
                            label="Your Name"
                            validators={[VALIDATOR_MINLENGTH(5)]}
                            errorText="Please enter a name."
                            onInput={inputHandler}
                        />
                    )}
                    <Input
                        element="input"
                        id="email"
                        type="email"
                        label="E-Mail"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid email address."
                        onInput={inputHandler}
                    />
                    <Input
                        element="input"
                        id="password"
                        type="password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(6)]}
                        errorText="Please enter a valid password, at least 6 characters."
                        onInput={inputHandler}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Button>
                </form>
                <Button inverse onClick={switchModeHandler}>
                    {isLogin ? 'Sign Up' : 'Login'}
                </Button>
            </Card>
        </>
    );
};

export default Auth;
