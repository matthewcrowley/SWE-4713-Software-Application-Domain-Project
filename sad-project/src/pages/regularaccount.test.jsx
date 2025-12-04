import ReactDOMClient from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
    Navigate,
    MemoryRouter,
    BrowserRouter
} from "react-router-dom";
import '@testing-library/jest-dom/vitest'
import {prettyDOM, render, screen} from '@testing-library/react';
import App from '../App.jsx'
import {describe, it, expect, test, afterEach,beforeAll,beforeEach,afterAll, cleanup, first, vi} from 'vitest';
import React from "react";
import Administrator from "./administrator.jsx";
import Manager from "./manager.jsx";
import Regularaccountuser from "./regularaccountuser.jsx";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Regular Account Page', () => {

    beforeEach(() => {
        mockNavigate.mockClear()
    })

    const renderAccount = () => {
        return render(
            <BrowserRouter>
                <Regularaccountuser setIsLoggedIn={true} />
            </BrowserRouter>
        );
    };

    it('renders without crashing', () => {
        renderAccount()

        if (typeof window !== 'undefined') {
            console.log('You are on the browser');

            // ✅ Can use window here
            console.log(window.innerWidth);

            window.addEventListener('mousemove', () => {
                console.log('Mouse moved');
            });
        } else {
            console.log('You are on the server');
            // ⛔️ Don't use window here
        }
        console.log('Error associated with this test is an inconsistent error which is not diagnosable at the time')

    })

    it('renders header of account', () => {
        expect(screen.getByTestId("account-header")).toBeInTheDocument();
        expect(screen.getByTestId('user-section')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Account Management/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Chart of Accounts/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Event Log/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Journalize/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Financial Reports/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    })

    it('renders financial ratios', () => {
        expect(screen.getByText('Financial Ratios')).toBeInTheDocument();
        console.debug(prettyDOM()) //render method to be researched more
        expect(screen.getByTestId("ratio-grid")).toBeInTheDocument();

    })


    it('renders account service navigation', () => {
        const accesses = screen.getAllByRole("button", { name: /Access Service/i });
        expect(accesses.length).toBe(5);
        expect(screen.getByTestId('services-grid')).toBeInTheDocument();
        expect(screen.getByText("view accounts"))
        expect(screen.getByText("View and filter all accounts"))
        expect(screen.getByText("View system activity and changes"))
        expect(screen.getByText("Generate financial reports"))


    })

})