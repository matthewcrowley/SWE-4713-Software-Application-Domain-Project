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
import {findAllByAltText, prettyDOM, render, screen, waitFor} from '@testing-library/react';
import App from '../App.jsx'
import {describe, it, expect, test, afterEach,beforeAll,beforeEach,afterAll, cleanup, first, vi} from 'vitest';
import React, {useEffect, useState} from "react";
import Administrator from "./administrator.jsx";
import Chartofaccounts from "./Chartofaccounts.jsx";
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const wrapper = ({ children }) => {
    return <MemoryRouter>{children}</MemoryRouter>
}


describe('Chart of Accounts Page', () => {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    it('Renders without crashing', async () => {
        render(<Administrator setIsLoggedIn={true}/>, wrapper);
        const user = userEvent.setup()

        const cofaButton = screen.getByRole('button', { name: /📋 Chart of Accounts/i });
        await user.click(cofaButton);
        render(<Chartofaccounts />);
        await delay(2000);


        expect(screen.getByText("Search and Filter Accounts")).toBeInTheDocument();
        expect(screen.getByText("Manage your accounts here.")).toBeInTheDocument()

    })

    it('Render header for Chart of Accounts', async () => {
        expect(screen.getAllByRole('heading', { name: /Chart of Accounts/i})).toHaveLength(3);
        expect(screen.getByRole("button", {name: /View All Accounts Report/i})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Email Admin or Manager/i})).toBeInTheDocument();
        expect(screen.getAllByRole("button", {name: '?'})).toHaveLength(2);




    })

    it('Render Search and Filter Accounts', () => {
       expect(screen.getByRole('heading', { name: /Search and Filter Accounts/i})).toBeInTheDocument();

       expect(screen.getByRole('button', { name: /Search/i}));
        expect(screen.getByText('Select a filter type and enter a search term to find accounts.')).toBeInTheDocument();

    })

    it('Render Chart of Accounts', async () => {

        expect(screen.getByRole('button', { name: /Add Account/i}));


    })

})