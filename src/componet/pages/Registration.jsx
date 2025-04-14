import React, { useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router";
import * as Yup from 'yup';
import "../../styles/pages_styles/Registration.css";
import useApiUrl from "../commonComponet/useApiUrl.js";
import { postApiData } from "../../config.js";
import Loader from "../commonComponet/Loader.jsx";


const registrationDetails = [
    { detail: "User Name", placeholder: "abc", name: "userName", type: "text" },
    { detail: "User Contact", placeholder: "1547856952", name: "userContact", type: "tel" },
    { detail: "User Email", placeholder: "abc@gmail.com", name: "userEmail", type: "email" },
    { detail: "User Password", placeholder: "password", name: "userPassword", type: "password" },
    { detail: "confirm Password", placeholder: "conform password", name: "userConfirmPassword", type: "password" },
    { detail: "User Address", placeholder: "21 no,abc street,abc area", name: "userAddress", type: "text" }
];

// Validation Schema
const validationSchema = Yup.object().shape({
    userName: Yup.string()
        .matches(/^[A-Za-z\s]+$/, "User Name cannot contain numbers")
        .required("User Name is required"),
    userContact: Yup.string()
        .matches(/^\d+$/, "User Contact must contain only numbers")
        .min(10, "User Contact must be at least 10 digits")
        .max(10, "User Contact must be  10 digits not more")
        .required("User Contact is required"),
    userEmail: Yup.string()
        .email("Invalid email format")
        .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Invalid email format")
        .required("User Email is required"),
    userPassword: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .max(10, "Password not more then 10 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
        .required("User Password is required"),
    userConfirmPassword: Yup.string()
        .oneOf([Yup.ref("userPassword")], "Passwords must match"),
    userAddress: Yup.string()
        .required("User Address is required"),
});


const Registration = () => {
    const baseUrl = useApiUrl()
    const [flippedPages, setFlippedPages] = useState(0);
    const [frontPageDisplay, setFrontPageDisplay] = useState(1);
    const [bookCoverOpen, setBookCoverOpen] = useState(false);
    const [backBookCoverOpen, setBackBookCoverOpen] = useState(false);
    const [userInfo, setUserInfo] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [ragistrtionResponse, setRagistrtionResponse] = useState("")

    const navigate = useNavigate();

    const inputRefs = useRef([]);

    const flipPage = (direction, values, errors) => {

        const currentIndex = flippedPages;

        if (!bookCoverOpen) {
            setBookCoverOpen(true);
        } else if (backBookCoverOpen) {
            setBackBookCoverOpen(false);
        } else {
            const currentField = registrationDetails[flippedPages]?.name;

            if (direction === "next") {
                if (!errors[currentField] && values[currentField]) {
                    setFlippedPages((prev) => prev + 1);
                    setFrontPageDisplay((prev) => prev + 1);

                    setUserInfo((prev) => ({
                        ...prev,
                        [currentField]: values[currentField],
                    }));

                    setTimeout(() => {
                        inputRefs.current[currentIndex + 1]?.focus(); // Move focus to next input
                    }, 100);

                }
            } else if (direction === "prev") {
                if (!errors[currentField]) {
                    setFlippedPages((prev) => Math.max(prev - 1, 0));
                    setFrontPageDisplay((prev) => Math.max(prev - 1, 1));

                    setTimeout(() => {
                        inputRefs.current[currentIndex - 1]?.focus(); // Move focus to previous input
                    }, 100);
                }
            }

            if (direction === "prev" && flippedPages === 0) {
                setBookCoverOpen(false);
            }

            if (direction === "next" && flippedPages === registrationDetails.length) {
                setBackBookCoverOpen(true);
            }
        }
    };

    const getAutoCompleteValue = (fieldName, values) => {
        const autoCompleteValues = {
            userName: "name",
            userContact: "tel",
            userEmail: "email",
            userPassword: "new-password",
            userConfirmPassword: "conform-Password",
            userAddress: "street-address"
        };
        return autoCompleteValues[fieldName] || "off";
    };

    const postRegistration = async (userData, values) => {
        setShowLoader(true);
        try {

            const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/user/registration`, userData)
            setShowLoader(false)

            if (res && res.status === 200) {

                const autoLogin = {
                    email: values?.userEmail,
                    password: values?.userPassword,
                }

                localStorage.setItem("userRagistretion", JSON.stringify(autoLogin))
                setTimeout(() => {

                    navigate(`/Login`);
                }, 400);
            }

            if (res && res.status === 409) {
                setRagistrtionResponse(res?.message)
                setTimeout(() => {
                    setRagistrtionResponse("")
                }, 2000);
            }

        } catch (error) {
            setShowLoader(false)
            console.error("Error to Registration", error)
        }
    }

    return (
        <>
            <div className="ragistrtion-book">
                {
                    ragistrtionResponse &&
                    <div className="error-message">
                        <h1>{ragistrtionResponse}</h1>
                    </div>
                }
                <Formik
                    initialValues={{
                        userName: "",
                        userContact: "",
                        userEmail: "",
                        userPassword: "",
                        userConfirmPassword: "",
                        userAddress: "",
                    }}
                    validationSchema={validationSchema}
                    validateOnChange
                    validateOnBlur
                    onSubmit={
                        async (values, actions) => {
                            const data = {
                                user_name: values?.userName,
                                contect_no: values?.userContact,
                                email: values?.userEmail,
                                password: values?.userPassword,
                                address: values?.userAddress,
                            };

                            if (data) {
                                postRegistration(data, values)
                            } else {
                                console.error("Form data is required")
                            }
                        }
                    }
                >
                    {(
                        {
                            values,
                            errors,
                            isSubmitting
                        }) => (
                        <Form className="Book_Body">
                            {/* Left Arrow Button */}
                            {
                                bookCoverOpen ?
                                    <button
                                        className={`prev_button ${bookCoverOpen && !backBookCoverOpen ? "prve_button_move" : ""}`}
                                        type="button"
                                        onClick={() => flipPage("prev", values, errors)}
                                    >
                                        <i className="fa fa-arrow-circle-left"></i>
                                    </button>

                                    : null
                            }

                            {/* Book Pages */}
                            <div
                                className={`Book ${bookCoverOpen && !backBookCoverOpen ? "Book_move" : ""}  
                        ${flippedPages === registrationDetails.length && backBookCoverOpen ? "Book_current_location" : ""}`}
                            >
                                {/* Front Book Cover */}
                                <div className={`Book_front_cover ${bookCoverOpen ? "front_cover_opened" : "front_cover_close"}`}>
                                    <div className="front" >
                                        {/* <div className="front" id={!bookCoverOpen ? "p1" : "p2"}> */}
                                        <div className="Book_Cover_front_Content">
                                            <h1>User Registration Book</h1>
                                            {
                                                !values?.userName ?
                                                    <div className="get-info-lo-rag">
                                                        <button type="button" onClick={() => { navigate("/login") }}>
                                                            login
                                                        </button>
                                                        <button type="button" onClick={() => flipPage("next", values, errors)}>
                                                            registration
                                                        </button>
                                                    </div>
                                                    : null

                                            }
                                        </div>
                                    </div>
                                    <div className="back">
                                        <div className="Book_Cover_back_Content">
                                            <h1>Fill all fields</h1>
                                        </div>
                                    </div>
                                </div>

                                {/* Pages */}
                                <div className="Book_pages">
                                    {registrationDetails.map((item, index) => (
                                        <div
                                            key={index}
                                            id={frontPageDisplay === index + 1 ? "p1" : "p2"}
                                            className={`page ${flippedPages >= index + 1 ? "flipped" : ""}`}
                                        >
                                            <div className="front">
                                                <div className="front-content">
                                                    <div className="user_info">
                                                        <h1>{item.detail}</h1>
                                                    </div>
                                                    <div className="user_info_input">
                                                        <Field
                                                            type={item.type}
                                                            name={item.name}
                                                            placeholder={item.placeholder}
                                                            autoComplete={getAutoCompleteValue(item.name, values)}
                                                            innerRef={(el) => (inputRefs.current[index] = el)}
                                                        />
                                                        <ErrorMessage name={item.name} component="span" className="error" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="back">
                                                <div className="back-content">
                                                    <div className="user_submitted_info">
                                                        <h1>Submitted Details</h1>
                                                        {Object.entries(userInfo).map(([key, value]) => (
                                                            <div key={key} className="user_Data">
                                                                <strong className="info_title">{key} <span>:</span></strong>
                                                                <span className={`user_value ${key === "userPassword" || key === "userConfirmPassword" ? "Password" : null}`} > {value} </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Back Book Cover */}
                                <div className={`Book_front_cover ${!backBookCoverOpen ? "Back_cover_opened" : "Back_cover_close"}`}>
                                    <div className="front" >
                                        {/* <div className="front" id={!backBookCoverOpen ? "b1" : "p2"}> */}
                                        {
                                            registrationDetails.length === flippedPages ?
                                                <div className="Book_Cover_front_Content">
                                                    <h1>Check the side information you provided. If all the details are accurate, click the button below to register</h1>
                                                    <button type="button" onClick={() => flipPage("next", values, errors)}>
                                                        register
                                                    </button>
                                                </div>
                                                : null
                                        }
                                    </div>
                                    <div className="back">
                                        <div className="Book_Cover_back_Content">
                                            <h1>Click the 'Below' button to confirm your registration</h1>
                                            <button type="submit"  >
                                                confirm register
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Arrow Button */}
                            {registrationDetails.length !== flippedPages ?
                                <button
                                    className={`next_button ${bookCoverOpen && !backBookCoverOpen ? "next_button_move" : ""}`}
                                    type="button"
                                    onClick={() => flipPage("next", values, errors)}
                                >
                                    <i className="fa fa-arrow-circle-right"></i>
                                </button>
                                : null
                            }
                        </Form>
                    )}
                </Formik>

                {
                    showLoader ?
                        <Loader />
                        : null
                }
            </div >

            <div className="registration-form-moblie">
                {
                    ragistrtionResponse &&
                    <div className="error-message">
                        <h1>{ragistrtionResponse}</h1>
                    </div>
                }
                <Formik
                    initialValues={{
                        userName: "",
                        userContact: "",
                        userEmail: "",
                        userPassword: "",
                        userConfirmPassword: "",
                        userAddress: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values) => {
                        const data = {
                            user_name: values?.userName,
                            contect_no: values?.userContact,
                            email: values?.userEmail,
                            password: values?.userPassword,
                            address: values?.userAddress,
                        };
                        postRegistration(data, values);
                    }}
                >
                    {({ values, errors, isSubmitting, setErrors }) => (
                        <Form className="form">
                            <div className="form-heading">
                                <h1>User Registration</h1>
                            </div>

                            <div className="input-field">
                                <label htmlFor="userName">User Name</label>
                                <Field type="text" name="userName" id="userName" />
                                <ErrorMessage name="userName" component="span" className="error" />
                            </div>

                            <div className="input-field">
                                <label htmlFor="userContact">User Contact</label>
                                <Field type="tel" name="userContact" id="userContact" />
                                <ErrorMessage name="userContact" component="span" className="error" />
                            </div>

                            <div className="input-field">
                                <label htmlFor="userEmail">User Email</label>
                                <Field type="email" name="userEmail" id="userEmail" />
                                <ErrorMessage name="userEmail" component="span" className="error" />
                            </div>

                            <div className="input-field">
                                <label htmlFor="userPassword">User Password</label>
                                <Field type="password" name="userPassword" id="userPassword" />
                                <ErrorMessage name="userPassword" component="span" className="error" />
                            </div>

                            <div className="input-field">
                                <label htmlFor="userConfirmPassword">Confirm Password</label>
                                <Field type="password" name="userConfirmPassword" id="userConfirmPassword" />
                                <ErrorMessage name="userConfirmPassword" component="span" className="error" />
                            </div>

                            <div className="input-field">
                                <label htmlFor="userAddress">User Address</label>
                                <Field type="text" name="userAddress" id="userAddress" />
                                <ErrorMessage name="userAddress" component="span" className="error" />
                            </div>

                            <div className="button">
                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Register"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>

                {showLoader && <Loader />}
            </div>
        </>
    );
};

export default Registration;
