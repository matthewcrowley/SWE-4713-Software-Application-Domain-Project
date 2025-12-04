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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Manager Page', () => {

    beforeEach(() => {
        mockNavigate.mockClear()
    })

    const renderManager = () => {
        return render(
            <BrowserRouter>
                <Manager setIsLoggedIn={true} />
            </BrowserRouter>
        );
    };

    it('renders without crashing', () => {
        renderManager()

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
    })

    it('renders header of management', () => {
        expect(screen.getByTestId("manager-header")).toBeInTheDocument();
        expect(screen.getByTestId('user-section')).toBeInTheDocument();
        expect(screen.getByText('Manager')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Account Management/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Chart of Accounts/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Event Log/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    })

    it('renders financial ratios', () => {
        expect(screen.getByText('Financial Ratios')).toBeInTheDocument();
        console.debug(prettyDOM()) //render method to be researched more
        expect(screen.getByTestId("ratio-grid")).toBeInTheDocument();

    })

    it('renders manager service navigation', () => {
        const accesses = screen.getAllByRole("button", { name: /Access Service/i });
        expect(accesses.length).toBe(7);
        expect(screen.getByTestId('services-grid')).toBeInTheDocument();
        expect(screen.getByText("Add, view, edit, or deactivate accounts"))
        expect(screen.getByText("View and filter all accounts"))
        expect(screen.getByText("View system activity and changes"))

    })

})