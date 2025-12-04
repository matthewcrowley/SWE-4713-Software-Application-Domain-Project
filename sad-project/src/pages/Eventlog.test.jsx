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
import AccountManagement from "./AccountManagement.jsx";
import Eventlog from "./Eventlog.jsx";

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


describe('Account Management Page', () => {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    it('Renders without crashing', async () => {
        render(<Administrator setIsLoggedIn={true}/>, wrapper);
        const user = userEvent.setup()

        const eventlogButton = screen.getByRole('button', {name: /📝 Event Log/i});
        await user.click(eventlogButton);
        render(<Eventlog/>, wrapper);
        await delay(1000);


        expect(screen.getByText("View all account changes, including before and after states.")).toBeInTheDocument();

    })



})