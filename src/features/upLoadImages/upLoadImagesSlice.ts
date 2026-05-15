import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
export interface ImageState {
    images: string[];
}

const initialState: ImageState = {
    images: []
}

export const upLoadImagesSlice = createSlice({
    name: 'upLoadImages',
    initialState,
    reducers: {
        addImage: (state, action: PayloadAction<{ index: number; url: string }>) => {
            if (action.payload.index >= state.images.length) {
                state.images.push(action.payload.url);
            } else {
                state.images[action.payload.index] = action.payload.url;
            }
        },

        removeImage: (state, action: PayloadAction<number>) => {
            state.images.splice(action.payload, 1);
        },

        clearImages: (state) => {
            state.images = [];
        },

        // Новый редьюсер для установки всего массива
        setImages: (state, action: PayloadAction<string[]>) => {
            // Фильтрация некорректных значений
            state.images = action.payload.filter(url =>
                typeof url === 'string' && url.startsWith('http')
            );
        },

    },
});

export const {
    addImage,
    removeImage,
    clearImages,
    setImages
} = upLoadImagesSlice.actions;

export default upLoadImagesSlice.reducer;




//*************************
// import { createSlice } from '@reduxjs/toolkit'
// import type { PayloadAction } from '@reduxjs/toolkit'
// import type { RootState } from '../../app/store'
//
// export interface ImageState {
//     images: string[]; // Изменили на массив
// }
//
// const initialState: ImageState = {
//     images: [] // Инициализируем пустым массивом
// }

// export const upLoadImagesSlice = createSlice({
//     name: 'upLoadImages',
//     initialState,
//     reducers: {
//         addImage: (state:any, action: PayloadAction<{ index: number; url: string }>) => {
//             state.images[action.payload.index] = action.payload.url;
//         },
//         removeImage: (state:any, action: PayloadAction<number>) => {
//             state.images.splice(action.payload, 1);
//         },
//         clearImages: (state:any) => {
//             state.images = [];
//         }
//     },
// })

//****************************************************
// export const upLoadImagesSlice = createSlice({
//     name: 'upLoadImages',
//     initialState,
//     reducers: {
//         addImage: (state, action: PayloadAction<{ index: number; url: string }>) => {
//             if (action.payload.index >= state.images.length) {
//                 state.images = [...state.images, action.payload.url];
//             } else {
//                 state.images[action.payload.index] = action.payload.url;
//             }
//         },
//         removeImage: (state, action: PayloadAction<number>) => {
//             state.images.splice(action.payload, 1);
//         },
//         clearImages: (state) => {
//             state.images = [];
//         },
//         setImages: (state) => {
//
//         }
//     },
// });
// export const {addImage, removeImage, clearImages} = upLoadImagesSlice.actions


// export const upLoadImagesSlice = createSlice({
//     name: 'upLoadImages',
//     initialState,
//     reducers: {
//         addImage: (state:any, action: PayloadAction<string>) => {
//             state.images.push(action.payload);
//         },
//         removeImage: (state:any, action: PayloadAction<number>) => {
//             state.images.splice(action.payload, 1);
//         },
//         clearImages: (state:any) => {
//             state.images = [];
//         },
//         setImageSrc: (state:any, action: PayloadAction<string>) => {
//              state.image = action.payload;
//          },
//     },
// })


// export interface ImageState {
//     image: string;
// }
//
// export interface Property {
//     image: string;
// }
//
// const initialState: ImageState = {
//    image: ''
// }
//
// export const upLoadImagesSlice = createSlice({
//     name: 'upLoadImages',
//     initialState,
//     reducers: {
//         setImageSrc: (state:any, action: PayloadAction<string>) => {
//             state.image = action.payload;
//         },
//
//     },
// })
//
// export const {setImageSrc} = upLoadImagesSlice.actions
// export default upLoadImagesSlice.reducer