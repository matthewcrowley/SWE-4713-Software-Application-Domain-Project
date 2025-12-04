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

    it("renders text elements", () => {
        expect(screen.getByRole('heading', { level: 1 } )).toBeInTheDocument();
        expect(screen.getByRole('img'), {altText: 'SweetLedger Logo'}).toBeInTheDocument();
        expect(screen.getByText("Reset Your Password - Step 1 of 3")).toBeInTheDocument();
        expect(screen.getByText("Username")).toBeInTheDocument();
        expect(screen.getByText("Email")).toBeInTheDocument();
        
    })

})