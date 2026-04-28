import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export interface CounterState {
    value: number
    properties: any
}

export interface Property {
    id: number;
    name: string;
}

const initialState: CounterState = {
    value: 0,
    properties: [{ id: 0, name: 'Sample Property 0' },],
}

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state:any) => {
            state.value += 1
        },
        decrement: (state:any) => {
            state.value -= 1
        },
        incrementByAmount: (state:any, action: PayloadAction<number>) => {
            state.value += action.payload
        },
        setNought: (state:any, action: PayloadAction<number>) => {
            state.value = action.payload
        },
        setProperties: (state:any, action: PayloadAction<Property[]>) => {
            state.properties = action.payload;
        },
        addProperty: (state:any, action: PayloadAction<Property>) => {
            state.properties.push(action.payload);
        },
        removeProperty: (state:any, action: PayloadAction<number>) => {
            state.properties = state.properties.filter((property:any) => property.id !== action.payload);
        },
    },
})

export const { increment, decrement, incrementByAmount,setNought ,setProperties, addProperty, removeProperty } = counterSlice.actions
export const selectCount = (state: RootState) => state.counter.value
export default counterSlice.reducer
