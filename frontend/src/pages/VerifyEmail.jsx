import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/client';


export default function VerifyEmail() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        async function verify() {

            const token = searchParams.get('token');


            if (!token) {

                toast.error(
                    'Invalid verification link.'
                );

                navigate('/login');
                return;

            }


            try {

                await api.get(
                    `/auth/verify-email?token=${token}`
                );


                toast.success(
                    'Email verified successfully! You can now log in.'
                );


                navigate('/login');


            } catch (err) {


                toast.error(
                    err.response?.data?.error ||
                    'Verification link expired or invalid.'
                );


            } finally {

                setLoading(false);

            }

        }


        verify();


    }, []);



    if (loading) {

        return (
            <p className="py-20 text-center text-marquee-muted">
                Verifying your email...
            </p>
        );

    }


    return null;

}