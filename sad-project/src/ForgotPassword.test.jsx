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


describe('Forgot Password Page', () => {
    it("renders forgot password page", () => {
        render(<ForgotPassword />, {wrapper});
        expect(screen.getByText("Reset Your Password - Step 1 of 3")).toBeInTheDocument();

    })

    it("renders initial text elements", () => {
        expect(screen.getByRole('heading', { level: 1 } )).toBeInTheDocument();
            expect(screen.getByText("Username")).toBeInTheDocument();
        expect(screen.getByText("Email")).toBeInTheDocument();

    })

    it("renders image & textField elements", () => {
        expect(screen.getByRole('img', {altText: 'SweetLedger Logo'})).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();


    })

    it("renders initial buttons", () => {
        expect(screen.getByRole('button', {name: 'Next'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Clear/i})).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /Back to Login/i})).toBeInTheDocument();

    })

    it("renders secondary elements & navigates", async () => {
        const user = userEvent.setup()

        const userbox = screen.getByPlaceholderText('Enter your username');
        const emailbox = screen.getByPlaceholderText('Enter your email');

        await user.type(userbox, 'something');
        await user.type(emailbox, 'something');

        await user.click(screen.getByRole('button', { name: /Next/i }));

        expect(screen.getByText('Reset Your Password - Step 2 of 3')).toBeInTheDocument();
        expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
        expect(screen.getByText('Security Question')).toBeInTheDocument();



        const ansbox = screen.getByPlaceholderText('Enter your answer');

        await user.type(ansbox, 'something');

        await user.click(screen.getByRole('button', { name: /Next/i }));

        expect(screen.getByText('Reset Your Password - Step 3 of 3')).toBeInTheDocument();
        expect(screen.getByText('New Password')).toBeInTheDocument();
        const passbox = screen.getByPlaceholderText('Enter your new password');

        await user.type(passbox, 'something1!');

        await user.click(screen.getByRole('button', { name: /Reset Password/i }));

        expect(screen.getByText('Password has been successfully reset!'))
    })

})