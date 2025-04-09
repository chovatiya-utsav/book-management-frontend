import axios from 'axios';

export const getApiData = (url, getData) => {
    if (url) {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...getData
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};


export const postApiImageData = (url, formData, config = {}) => {
    if (url) {
        return new Promise((resolve, reject) => {
            axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...config
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};

export const postApiData = (url, data, headers, config = {}) => {

    if (url) {
        return new Promise((resolve, reject) => {
            axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                ...config
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};



export const deleteApiData = (url, getData) => {
    return new Promise((resolve, reject) => {
        axios.delete(url, {
            headers: {
                "Content-Type": "application/json"
            },
            ...getData
        })
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}


export const putApiUserProfileUpdate = (url, bodyData, config = {}) => {

    if (url) {
        return new Promise((resolve, reject) => {
            axios.put(url, bodyData, {
                headers: {
                    "Content-Type": "application/json"
                },
                ...config
            }
            )
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
}

export const putApiData = (url, formData, config = {}) => {

    if (url) {
        return new Promise((resolve, reject) => {
            axios.put(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...config
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};