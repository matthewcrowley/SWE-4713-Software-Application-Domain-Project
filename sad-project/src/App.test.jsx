
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



describe ("Login Page", () => {

    afterEach(() => {
    vi.clearAllMocks();
  });

    it("renders default login page", () => {
        render(<App />);
        expect(screen.getByText("SweetLedger")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    })

    it("invalid login both fields", async () => {

        const user = userEvent.setup()

        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        const submitbtn = screen.getAllByTestId("loginbtn")[0];


        await user.click(submitbtn);
        expect(screen.getByText("Please enter both fields.")).toBeInTheDocument();
    })

    it("invalid login short user", async () => {

        const user = userEvent.setup()

        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        const submitbtn = screen.getAllByTestId("loginbtn")[0];



        const userbox = screen.getByPlaceholderText('Enter your username');
        const passbox = screen.getByPlaceholderText('Enter your password');


        await user.type(userbox, 'bad');
        await user.type(passbox, 'bad');


        await user.click(submitbtn);
        expect(screen.getByText("Username must be at least 8 characters.")).toBeInTheDocument();
    })

    it("invalid login no credential", async () => {

        const user = userEvent.setup()

        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        const submitbtn = screen.getAllByTestId("loginbtn")[0];



        const userbox = screen.getByPlaceholderText('Enter your username');
        const passbox = screen.getByPlaceholderText('Enter your password');


        await user.type(userbox, 'badusername');
        await user.type(passbox, 'bad');


        await user.click(submitbtn);
        expect(screen.getByText("Processing...")).toBeInTheDocument();
    })

    it("Identify Key Text Elements", () => {

        expect(screen.getByText("Username")).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /SweetLedger/i })).toBeInTheDocument();
        expect(screen.getByRole('paragraph')).toBeInTheDocument();


        expect(screen.getByText("Password")).toBeInTheDocument();


    })

    it("Identify Key Button Elements", () => {

        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create New Account/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();

    })

    it("Identify Link Elements", () => {

        expect(screen.getByRole('link', { name: /Forgot Password?/i })).toBeInTheDocument();

    })


    it("Identify Image Element", () => {

        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.getByAltText('SweetLedger Logo')).toBeInTheDocument();

    })


})