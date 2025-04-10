import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../../styles/pages_styles/UserProfile.css";
import useApiUrl from "../commonComponet/useApiUrl";
import Loader from "../commonComponet/Loader"
import BookReviewModal from "../commonComponet/BookReviewModal";
import { deleteApiData, getApiData, postApiData } from "../../config";

const validationSchema = Yup.object().shape({
    user_name: Yup.string()
        .matches(/^[A-Za-z\s]+$/, "Name cannot contain numbers")
        .required("Name is required"),
    email: Yup.string()
        .email("Invalid email format")
        .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Invalid email format")
        .required("Email is required"),
    contect_no: Yup.string()
        .matches(/^\d+$/, "Contact must contain only numbers")
        .min(10, "Contact must be exactly 10 digits")
        .max(10, "Contact must be exactly 10 digits")
        .required("Contact is required"),
});

const UserProfile = () => {
    const baseUrl = useApiUrl();
    const [profile, setProfile] = useState({
        user_name: "",
        email: "",
        contect_no: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const [bookData, setBookData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [userData, setUserData] = useState(null);
    const [readLaterbookData, setReadLaterbookData] = useState(null);
    const [user, setUser] = useState(false);
    const [readLeater, setReadLeater] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const token = localStorage.getItem("token");


    useEffect(() => {

        getUserData();

        if (token) {
            setUserData(user._id);
            fetchReadLaterBook();
        }
    }, []);

    useEffect(() => {
        if (profile.id) {
            fetchBooks(profile.id);
            fetchReadLaterBook();
        }
    }, [profile.id, !successMessage]);

    const getUserData = async () => {
        try {
            const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/user`, { token })

            if (res && res?.status === 200) {
                setProfile({
                    user_name: res?.data?.user_name,
                    email: res?.data?.email,
                    contect_no: res?.data?.contect_no,
                    id: res?.data?._id
                })
                setProfileImage(res?.data.profile_image);
            } else {
                console.error("user not found")
            }

        } catch (error) {
            console.error("Falid to fetch", error)
        }
    }

    const toggleModal = (book, name) => {
        setUserReview(null);
        setUser(false)
        setReadLeater(false)

        if (name === "user") {
            setUser(true)
            setReadLeater(false)
            setSelectedBook(book);
        } else {
            setUser(false)
            fetchBookReview(book?._id);
            setSelectedBook(book);
            setReadLeater(name)
        }
        setModalOpen(!modalOpen);
    };

    const fetchBooks = async (userId) => {

        try {
            const res = await getApiData(`${process.env.REACT_APP_BASE_URL}/api/book`);
            if (res && res?.status === 200) {
                const userBooks = res?.data?.filter(r => r?.user_id === userId);
                if (userBooks) {
                    setBookData(userBooks);
                }
            } else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            console.error('Fetch Error:', error);
        }
    };


    const fetchBookReview = async (book_id) => {

        if (token && book_id) {
            const data = {
                token: token,
                book_id: book_id
            }
            try {
                const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/review/getreview`, data)

                if (res && res.status === 200) {
                    setUserReview({
                        rating: res.data.rating,
                        reviewText: res.data.comment,
                    })
                } else {
                    console.error('Failed to fetch books review');
                }

            } catch (error) {
                console.error('Review Fetch Error:', error);
            }
        }
    };

    const fetchReadLaterBook = async () => {

        const data = {
            token: token
        }

        try {
            const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/wishlist/getBookWishlist`, data)
            if (res && res.status === 200) {
                setReadLaterbookData(res?.data);
            } else {
                console.error('Failed to fetch review');
            }

        } catch (error) {
            console.error('Review Fetch Error:', error);

        }

    };

    const handleUpdateProfile = async (values) => {
        setLoading(true);

        const userData = {
            user_token: token,
            ...values,
        }

        try {

            const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/user/updateUserDetail`, userData, {
                'Content-Type': 'multipart/form-data',
            });

            if (res && res.status === 200) {
                setLoading(false)
                setSuccessMessage("profile updated successfully")
                setProfile({ ...profile, ...values });
                setIsEditing(false);

                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
            } else {
                setLoading(false)
                console.error("Failed to updating profile");
            }

        } catch (error) {
            setLoading(false)
            console.error("Error updating profile:", error);
        }

    };

    const deleteBook = async (id) => {

        setLoading(true);
        try {
            const res = await deleteApiData(`${process.env.REACT_APP_BASE_URL}/api/book/deleteBookById/${id}`)

            setLoading(false)
            if (res && res.status === 200) {
                setSuccessMessage("book remove susseccfully");
                setBookData(prevBooks => prevBooks.filter(book => book._id !== id));
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                toggleModal()
            } else {
                toggleModal()
                setSuccessMessage("Unexpected error occurred");
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
            }

        } catch (error) {
            toggleModal()
            setLoading(false)
            setSuccessMessage("Unexpected error occurred");
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);
            console.error('Delete Book Error:', error);
        }
    }

    const deleteReadLaterBook = async (readLaterBookId) => {
        setLoading(true);
        try {
            const res = await deleteApiData(`${process.env.REACT_APP_BASE_URL}/api/wishlist/deleteWishlist/${readLaterBookId}`)

            setLoading(false)
            if (res && res.status === 200) {
                setSuccessMessage("read later book remove susseccfully")
                setLoading(false)
                setReadLaterbookData(prevBooks => prevBooks.filter(book => book._id !== readLaterBookId));
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
                toggleModal()
            } else {
                toggleModal()
                setSuccessMessage("Unexpected error occurred");
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 2000);
            }

        } catch (error) {
            toggleModal()
            setLoading(false)
            setSuccessMessage("Unexpected error occurred");
            setTimeout(() => {
                setSuccessMessage(null)
            }, 2000);
            console.error('Delete Book Error:', error);
        }
    };


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Preview image before uploading
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl); // Set preview image

        // Upload the image
        handleImageUpload(file);
    };

    const handleImageUpload = async (file) => {
        setLoading(true);

        const formData = {
            profileImage: file,
            user_token: token
        }

        try {
            const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/user/updateUserDetail`, formData,)

            setLoading(false)
            if (res && res.status === 200) {
                setSuccessMessage("Image uploaded successfully!");
                setProfileImage(res?.data.profile_image);
                setTimeout(() => {
                    setSuccessMessage("");
                }, 2000);
            }
        } catch (error) {
            setLoading(false)
            console.error("error", error)
        }
    };

    return (
        <div className="user-profile-container">
            {
                successMessage ?
                    <div className='message'>
                        <h1>{successMessage}</h1>
                    </div>
                    : null
            }
            <h1>My Profile</h1>
            <div className="user-profile-card">
                <div className="user-profile-image-container">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />

                    {/* Clickable Profile Image */}
                    <label htmlFor="profile-upload">
                        <img
                            src={profileImage || "/images/author-image.png"}
                            alt="User Profile"
                            className="user-profile-image"
                            style={{ cursor: "pointer" }}
                        />
                    </label>
                </div>

                {!isEditing ? (
                    <div className="user-profile-info">
                        <h2>{profile.user_name}</h2>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Contact No:</strong> {profile.contect_no}</p>
                        <button className="edit-user-profile-btn" onClick={() => setIsEditing(true, "user")}>
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <Formik
                        initialValues={{
                            user_name: profile.user_name,
                            email: profile.email,
                            contect_no: profile.contect_no,
                        }}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleUpdateProfile}
                    >
                        {({ isSubmitting, handleSubmit }) => (
                            <Form onSubmit={handleSubmit} className="user-profile-edit-form">
                                <label htmlFor="name">Name:</label>
                                <Field type="text" name="user_name" id="name" />
                                <ErrorMessage name="user_name" component="span" className="error" />

                                <label htmlFor="email">Email:</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="span" className="error" />

                                <label htmlFor="contactNo">Contact No:</label>
                                <Field type="text" name="contect_no" id="contactNo" />
                                <ErrorMessage name="contect_no" component="span" className="error" />

                                <div className="form-buttons">
                                    <button type="submit" disabled={isSubmitting} className="save-btn">
                                        Save Changes
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}

            </div>
            <div className="nav-link">
                <ul>
                    {/* Use normal anchor links instead of NavLink for internal page navigation */}
                    <li> <a href="#my-Book">My Book</a> </li>
                    <li> <a href="#read-later">Read Later Book</a> </li>
                </ul>
            </div>
            <div className="my-book" id="my-Book">
                <h1>my book</h1>
                <div className="user-book">
                    <div className='book-Container'>
                        {
                            bookData && bookData.length > 0 ?
                                (bookData?.map((item, index) => {
                                    const rating = item?.rating || 0;
                                    const percentage = (rating / 5) * 75;
                                    return (
                                        <div className='book-card' key={index} onClick={() => toggleModal(item, "user")}>
                                            <img src={item?.book_image} alt="book-cover" />
                                            <div className='book-info'>
                                                <div className='book-reting'>
                                                    <h3 className="book-title">{item?.book_name}</h3>
                                                    <div className="rating-box">
                                                        <div className="star-wrapper">
                                                            <div className="star-background">★</div>
                                                            <div className="star-fill" style={{ width: `${percentage}%` }}>★</div>
                                                        </div>
                                                        <span className="rating-number">{item?.rating}</span>
                                                    </div>
                                                </div>
                                                <h2 className='author-name'>by {item?.author_name}</h2>
                                                <p className='book-amount'>₹{item?.price}</p>
                                            </div>
                                        </div>
                                    );
                                }))
                                :
                                <p>No books available</p>
                        }
                    </div>
                </div>
            </div>
            <div className="ReadLater-book" id="read-later">
                <h1>read later book</h1>
                <div className='book-Container'>
                    {
                        readLaterbookData && readLaterbookData.length > 0 ?
                            (
                                readLaterbookData?.map((item, index) => {
                                    const rating = item?.book_id?.rating || 0;
                                    const percentage = (rating / 5) * 75;
                                    return (
                                        <div className='book-card' key={index} onClick={() => toggleModal(item?.book_id, item?._id)}>
                                            <img src={item?.book_id?.book_image} alt="book-cover" />
                                            <div className='book-info'>
                                                <div className='book-reting'>
                                                    <h3 className="book-title">{item?.book_id?.book_name}</h3>
                                                    <div className="rating-box">
                                                        <div className="star-wrapper">
                                                            <div className="star-background">★</div>
                                                            <div className="star-fill" style={{ width: `${percentage}%` }}>★</div>
                                                        </div>
                                                        <span className="rating-number">{item?.book_id?.rating}</span>
                                                    </div>
                                                </div>
                                                <h2 className='author-name'>by {item?.book_id?.author_name}</h2>
                                                <p className='book-amount'>₹{item?.book_id?.price}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                            :
                            <p>No books available</p>
                    }
                </div>

                <BookReviewModal
                    show={modalOpen}
                    onClose={() => toggleModal(null)}
                    book={selectedBook}
                    userReview={userReview}
                    deleteBook={deleteBook}
                    user={user}
                    readLeaterBookRemove={readLeater}
                    deleteReadLaterBook={deleteReadLaterBook}
                />
            </div>
            {
                loading ?
                    <Loader />
                    :
                    null
            }


        </div>
    );
};


export default UserProfile
