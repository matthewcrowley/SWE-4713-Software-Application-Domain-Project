
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route, useNavigate, Navigate, MemoryRouter} from "react-router-dom";
import '@testing-library/jest-dom/vitest'
import {render, screen} from '@testing-library/react';
import App from './App.jsx'
import {describe, it, expect, test, afterEach,beforeAll,beforeEach,afterAll, cleanup, first, vi} from 'vitest';
import NewUser from './NewUser.jsx';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './ForgotPassword.jsx';
const wrapper = ({ children }) => {
	return <MemoryRouter>{children}</MemoryRouter>
}


describe("Login", () => {
    afterEach(() => {
    vi.clearAllMocks();
  });

    it("renders default login", () => {
        render(<App />);
        expect(screen.getByText("Username:")).toBeInTheDocument();

    })

    it("renders new user page", () => {
        render(<NewUser/>, {wrapper});
        expect(screen.getByLabelText("Password:")).toBeInTheDocument();

    })

    it("Navigates to new user page", async () =>{
        render(<App/>);
        const button = screen.getAllByRole("button", {name: /New User/i}).first;
        expect(button).toBeInTheDocument;
        userEvent.click(button);

        expect(screen.getByText("Create New User")).toBeInTheDocument();
    })

    it("renders forgot password page", () => {
        render(<ForgotPassword />, {wrapper});
        expect(screen.getByText("Forgot Password")).toBeInTheDocument();

    })
/*
    test("Rejects invalid Login", async () => {
        render(<App/>);
        const userbox = screen.getAllByRole('textbox')[0];
        const passbox = screen.getAllByRole('textbox')[1];
        const submitbtn = screen.getAllByTestId("loginbtn")[0];

        await userEvent.type(userbox, 'bad');
        await userEvent.type(passbox, 'Administrator#01');
        await userEvent.click(submitbtn);
        expect(screen.getByText("Username:")).toBeInTheDocument();
    })
        */
    
})