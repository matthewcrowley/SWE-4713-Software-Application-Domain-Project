import React from 'react';
import ReactDOMClient from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route, Navigate, MemoryRouter} from "react-router-dom";
import '@testing-library/jest-dom/vitest'
import {render, screen} from '@testing-library/react';
import App from './App.jsx'
import {describe, it, expect, test, afterEach,beforeAll,beforeEach,afterAll, cleanup, first, vi} from 'vitest';
import NewUser from './NewUser.jsx';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './ForgotPassword.jsx';
import * as page from "@testing-library/dom";
const wrapper = ({ children }) => {
    return <MemoryRouter>{children}</MemoryRouter>
}


describe ("New User Tests", () => {

    afterEach(() => {
        vi.clearAllMocks();
    });



    it("renders new user page", () => {
        render(<NewUser/>, {wrapper});
        expect(screen.getByText("Create New Account")).toBeInTheDocument();


    })

    it("renders text elements", () => {
        expect(screen.getByRole('heading', { level: 1 } )).toBeInTheDocument();
        expect(screen.getByRole('paragraph')).toBeInTheDocument();
        expect(screen.getByText("First Name")).toBeInTheDocument();
        expect(screen.getByText("Last Name")).toBeInTheDocument();
        expect(screen.getByText("Address")).toBeInTheDocument();
        expect(screen.getByText("Date of Birth")).toBeInTheDocument();
        expect(screen.getByText("Email Address")).toBeInTheDocument();
        expect(screen.getByText("Username")).toBeInTheDocument();
        expect(screen.getByText("Password")).toBeInTheDocument();
        expect(screen.getByText("Submit Request")).toBeInTheDocument();
        expect(screen.getByText("Clear")).toBeInTheDocument();
        expect(screen.getByText("Back to Login")).toBeInTheDocument();
    })

    it("renders input elements", () => {
        expect(screen.getByPlaceholderText("Enter your first name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your last name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your address")).toBeInTheDocument();
        expect(screen.getByTestId("dob-input")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    })

    it("renders clickable elements", () => {

        expect(screen.getByText("Submit Request")).toBeInTheDocument();
        expect(screen.getByText("Clear")).toBeInTheDocument();
        expect(screen.getByText("Back to Login")).toBeInTheDocument();
    })



})