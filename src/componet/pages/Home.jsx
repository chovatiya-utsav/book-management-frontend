import React, { useEffect, useState } from 'react';
import "../../styles/pages_styles/Home.css";
import TopViewBook from '../commonComponet/TopViewBook';
import BookReviewModal from '../commonComponet/BookReviewModal';
import TopAuthorBook from '../commonComponet/TopAuthorBook'
import { getApiData, postApiData } from '../../config';
import BookAndUserNo from '../commonComponet/BookAndUserNo';


const Home = () => {

    const [bookData, setBookData] = useState(null);
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [userNoData, setUserNoData] = useState(0);
    const [bookNoData, setBookNoData] = useState(0);
    const token = localStorage.getItem("token");


    useEffect(() => {
        fetchBooks()
        // const user = JSON.parse(localStorage?.getItem("userLogin")) || JSON.parse(localStorage?.getItem("userAdminLogin")) || null;
        // setUserData(user._id)
    }, [!modalOpen])

    useEffect(() => {
        fetchBookNo()
        fetchUserNo()
    }, [])

    const toggalModal = (book) => {
        setUserReview(null)
        if (book) {
            fetchBookReview(token, book._id);
            setSelectedBook(book);
        }
        setModalOpen(!modalOpen)
    }


    const fetchBookReview = async (token, book_id) => {

        if (token && book_id) {
            const data = {
                token: token,
                book_id: book_id
            }
            try {
                
                const res = await postApiData(`${process.env.REACT_APP_BASE_URL}/api/review/getreview`, data);

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
        } else {
            console.error("❌ Error: bookId is missing in API call!");

        }
    };


    const fetchBooks = async () => {
        try {
            const res = await getApiData(`${process.env.REACT_APP_BASE_URL}/api/book`);
            if (res && res?.status === 200) {
                setBookData(res?.data);
            } else {
                console.error('Failed to fetch books');
            }

        } catch (error) {
            console.error('Fetch Error:', error);
        }
    };

    const fetchUserNo = async () => {
        try {

            const res = await getApiData(`${process.env.REACT_APP_BASE_URL}/api/user/numberOfUsers`)

            if (res && res.status === 200) {
                setUserNoData(res?.data)
            } else {
                console.error("Falid user count")
            }

        } catch (error) {
            console.error("Error user count", error)
        }

    }
    const fetchBookNo = async () => {
        try {

            const res = await getApiData(`${process.env.REACT_APP_BASE_URL}/api/book/numberOfBooks`)

            if (res && res.status === 200) {
                setBookNoData(res?.data)
            } else {
                console.error("Falid user count")

            }

        } catch (error) {
            console.error("Error user count", error)
        }
    }

    return (
        <>

            <section className='book_slide block'>
                <div className='background_Book_image'>
                    <h1>
                        Welcome to our online book store<br />
                        <div className="typing-container">
                            <div className="text text-1">Designed and developed by Utsav, Vishesh, and Manan</div>
                            <div className="text text-2">Created by Manan, Utsav, and Vishesh</div>
                        </div>
                    </h1>
                </div>
            </section>

            {
                bookData && bookData.length > 0 ?
                    <section className='top-view-book-display'>

                        <TopViewBook
                            bookData={bookData}
                            toggalModal={toggalModal}
                        />
                    </section>
                    : null
            }

            <section className='our_value_section'>
                <BookAndUserNo userNoData={userNoData} bookNoData={bookNoData} />
            </section>
            <section className='top-author-book'>
                <TopAuthorBook bookData={bookData} />
            </section>

            <BookReviewModal
                show={modalOpen}
                onClose={() => setModalOpen(false)}
                book={selectedBook}
                userReview={userReview}
                readLater={true}
            />
        </>

    )
}

export default Home
