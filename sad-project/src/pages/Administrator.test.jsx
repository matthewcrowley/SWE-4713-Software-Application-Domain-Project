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
import {render, screen} from '@testing-library/react';
import App from '../App.jsx'
import {describe, it, expect, test, afterEach,beforeAll,beforeEach,afterAll, cleanup, first, vi} from 'vitest';
import React, {useEffect, useState} from "react";
import Administrator from "./administrator.jsx";

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Administrator Page', () => {


    beforeEach(() => {
        mockNavigate.mockClear()
    })

    const renderAdministrator = () => {
        return render(
            <BrowserRouter>
                <Administrator setIsLoggedIn={true} />
            </BrowserRouter>
        );
    };

    it('renders without crashing', () => {
        //Inconsistent ReferenceError in this test
        renderAdministrator()
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

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

        expect(screen.getByText("Administrator Dashboard")).toBeInTheDocument();
    })

    it('renders header of admin', () => {
        expect(screen.getByTestId("administrator-header")).toBeInTheDocument();
        expect(screen.getByTestId('user-section')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Account Management/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Chart of Accounts/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Event Log/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    })

    it('Does not render financial ratios', () => {
        //use query API for negative testing
        expect(screen.queryByText('Financial Ratios')).not.toBeInTheDocument();
    })

    it('renders administrator service navigation', () => {
        const accesses = screen.getAllByRole("button", { name: /Access Service/i });
        expect(accesses.length).toBe(3);
        expect(screen.getByTestId('services-grid')).toBeInTheDocument();
        expect(screen.getByText("Add, view, edit, or deactivate accounts"))
        expect(screen.getByText("View and filter all accounts"))
        expect(screen.getByText("View system activity and changes"))

    })

})