import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import confetti from 'canvas-confetti';
import '../../styles/pages_styles/AddBook.css';
import { Player } from '@lottiefiles/react-lottie-player';
import { getApiData, postApiImageData } from '../../config';
import { useLocation, useNavigate } from 'react-router';
import Loader from '../commonComponet/Loader';

const UpdateBook = () => {
    const location = useLocation();
    const navigate = useNavigate();


    const [preview, setPreview] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [bookId, setBookId] = useState(null)

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    const [cancelBook, setCancelBook] = useState(false)


    const defaultValue = {
        id: '',
        book_name: '',
        author_name: '',
        published_year: formattedDate,
        book_type: '',
        description: '',
        price: '',
        book_image: null
    };

    const [initialValues, setInitialValues] = useState(defaultValue);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const bookId = params.get('Book') || "";
        setBookId(bookId)

        // Load saved form data from localStorage
        const savedData = JSON.parse(localStorage?.getItem('userUpdateBookData')) || ""
        if (savedData) {
            setInitialValues(savedData);
            setPreview(savedData.book_image)
        }

        if (bookId) {
            fetchBooks(bookId);
            localStorage.setItem('bookUpdate', true)
        }
    }, []);

    const fetchBooks = async (bookId) => {
        setLoading(true)
        try {
            const res = await getApiData(`${process.env.REACT_APP_BASE_URL}/api/book/findBookById/${bookId}`);
            setLoading(false)

            if (res && res?.status === 200) {
                if (res && res?.data) {
                    setInitialValues({ ...res?.data });
                    if (res?.data.book_image) {
                        setPreview(res?.data.book_image);
                    }
                }
            } else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            setLoading(false)
            console.error('Fetch Error:', error);
        }
    };

    const validationSchema = Yup.object({
        book_name: Yup.string().trim().required('Book name is required'),
        author_name: Yup.string()
            .trim()
            .matches(/^[A-Za-z\s]+$/, 'author_name name must only contain letters')
            .required('author_name is required'),
        book_type: Yup.string().trim().required('book_type is required'),
        description: Yup.string().trim().required('description is required'),
        price: Yup.number()
            .typeError('price must be a number')
            .positive('price must be positive')
            .required('price is required'),
        book_image: Yup.mixed().required('Cover image is required')
    });



    const firworkAnimation = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 20, spread: 260, ticks: 1000, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const fireworkInterval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(fireworkInterval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };


    const handleFormSubmit = async (values, resetForm) => {
        setShowLoader(true);
        const data = {
            book_id: values._id,
            book_name: values?.book_name,
            author_name: values?.author_name,
            book_type: values?.book_type,
            description: values?.description,
            price: values?.price,
            category: values?.category,
            published_year: values?.published_year,
            book_image: values?.book_image,
        }

        try {
            const response = await postApiImageData(`${process.env.REACT_APP_BASE_URL}/api/book/updateBook`, data);

            setShowLoader(false);

            if (response && response.status === 200) {
                localStorage.setItem("bookupdatedelete", true); // Remove saved data
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                setShowSuccessModal(true);
                firworkAnimation();
                setInitialValues(defaultValue);
                localStorage.setItem("bookUpdate", false);
                localStorage.removeItem("userUpdateBookData");
                resetForm();
                setPreview(null);
                setTimeout(() => {
                    localStorage.setItem("bookupdatedelete", false); // Remove saved data
                }, 100);

            } else {
                alert(response?.message || 'Something went wrong');
            }
        } catch (err) {
            setShowLoader(false)
            console.error(err);
            alert('Failed to submit form');
        }
    };


    const cancelBookForm = () => {
        // Remove saved data
        localStorage.setItem("bookupdatedelete", true); // Remove saved data
        localStorage.setItem("bookUpdate", false);
        setInitialValues(defaultValue); // Reset initial form values
        formData?.resetForm(); // ✅ Reset Formik form
        setShowConfirmModal(false);
        setCancelBook(false);
        localStorage.removeItem("userUpdateBookData"); // Remove saved data
        setPreview(null); // Clear preview image
        setTimeout(() => {
            localStorage.setItem("bookupdatedelete", false); // Remove saved data
        }, 100);
        navigate("/Home")
    };


    return (
        <div className="add-book-container">
            <h2>Update Book</h2>
            <Formik
                initialValues={initialValues}
                enableReinitialize={true}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {

                    setFormData({ values, resetForm });
                    setShowConfirmModal(true);
                    setSubmitting(false);
                    if (values?.book_name == "" || values?.author_name == "" || values?.book_image == "" || !values?.book_image || values?.description == "" || values?.book_type == "" || values?.price == "") {
                        localStorage.removeItem("userUpdateBookData")
                    }
                }}
            >
                {({ values, setFieldValue, resetForm }) => {
                    if (values?.book_name !== "" || values?.author_name !== "" || values?.book_image || values?.description !== "" || values?.book_type !== "" || values?.price !== "") {
                        if (JSON.parse(localStorage?.getItem("bookupdatedelete")) === false) {
                            localStorage.setItem("userUpdateBookData", JSON.stringify(values));
                        }
                    }
                    return (
                        <Form className="book-form">
                            <div className="form-group">
                                <label>Book Name</label>
                                <Field type="text" name="book_name" placeholder="Enter book name" />
                                <ErrorMessage name="book_name" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>author name</label>
                                <Field type="text" name="author_name" placeholder="Enter author_name name" />
                                <ErrorMessage name="author_name" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>Published Year</label>
                                <Field type="text" name="published_year" readOnly placeholder="Current Year" />
                            </div>

                            <div className="form-group">
                                <label>book type</label>
                                <Field type="text" name="book_type" placeholder="Enter book_type (e.g. Fiction)" />
                                <ErrorMessage name="book_type" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>description</label>
                                <Field as="textarea" name="description" rows="4" placeholder="Write a brief description of the book..." />
                                <ErrorMessage name="description" component="div" className="error" />
                            </div>

                            <div className="form-group">
                                <label>price</label>
                                <Field type="number" name="price" min="0" placeholder="Enter price (e.g. 499)" />
                                <ErrorMessage name="price" component="div" className="error" />
                            </div>
                            <div className="form-group">
                                <label>Cover Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        if (file) {
                                            setFieldValue('book_image', file);
                                            setPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <ErrorMessage name="book_image" component="div" className="error" />
                                {preview && (
                                    <div className="image-preview">
                                        <img src={preview} alt="Preview" />
                                    </div>
                                )}
                            </div>
                            <div className='btn'>
                                <button type="submit">Update Book</button>
                                <button
                                    type="button"
                                    className="denger"
                                    onClick={() => {
                                        setShowConfirmModal(true);
                                        setCancelBook(true);
                                        setFormData((prev) => ({ ...prev, resetForm })); // ✅ Store resetForm
                                    }}
                                >
                                    Cancel
                                </button> </div>
                        </Form>)
                }}
            </Formik>

            {
                showConfirmModal && (
                    <div className="addBook-modal-overlay">
                        <div className="modal-content scale-in">
                            <span className="close-icon" onClick={() => setShowConfirmModal(false)}>✖</span>
                            {cancelBook ?
                                <p>Are you sure you want to not Update  this book?</p>
                                :
                                <p>Are you sure you want to Update this book?</p>
                            }
                            <div className="modal-actions">
                                <button
                                    className="btn-confirm"
                                    onClick={() => {
                                        if (cancelBook) {
                                            cancelBookForm(); // ✅ Now cancelBookForm has access to resetForm
                                        } else {
                                            setShowConfirmModal(false);
                                            if (formData) {
                                                handleFormSubmit(formData.values, formData.resetForm);
                                            }
                                        }
                                    }}
                                >
                                    {cancelBook ?
                                        "Yes, cancel"
                                        :
                                        "Yes, Update"
                                    }
                                </button>
                                <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }



            {
                showLoader && (
                    <div className="loader-overlay">
                        <div className="loader-content">
                            <Player
                                autoplay
                                speed={2.5}
                                loop
                                src="/images/book-loader.json"
                                style={{ height: '300px', width: '300px' }}
                            />
                            <h2 className="loader-text">Book is Updating to library<span className="dot-animate"></span></h2>
                        </div>
                    </div>
                )
            }



            {
                showSuccessModal && (
                    <div className="addBook-modal-overlay">
                        <div className="modal-content scale-in">
                            <span className="close-icon" onClick={() => { setShowSuccessModal(false); navigate("/Home") }}>✖</span>
                            <h3>🎉 Book updated  successfully!</h3>
                            <button className="btn-confirm" onClick={() => { setShowSuccessModal(false); navigate("/Home") }}>Close</button>
                        </div>
                    </div>
                )
            }

            {
                Loading ?
                    <Loader />
                    : null
            }
        </div >
    );
};

export default UpdateBook;



