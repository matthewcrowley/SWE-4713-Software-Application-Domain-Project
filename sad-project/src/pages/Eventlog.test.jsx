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

const renderwithRouter = (component) => {
    return(
        render(<BrowserRouter>
            {component}
        </BrowserRouter>)
    )


}


describe('Account Management Page', () => {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    it('Renders without crashing', async () => {
        renderwithRouter(<Administrator setIsLoggedIn={true}/>);
        const user = userEvent.setup()

        const eventlogButton = screen.getByRole('button', {name: /📝 Event Log/i});
        await user.click(eventlogButton);
        renderwithRouter(<Eventlog/>);
        await delay(1500);


        expect(screen.getByText("View all account changes, including before and after states.")).toBeInTheDocument();

    })

    it('Renders major elements', () => {
        const eventLog = screen.queryAllByText('Event Log');
        expect(eventLog.length).toBeGreaterThanOrEqual(1);
        expect(screen.queryByRole('table')).toBeInTheDocument();

    })

    it('Renders Table Headers', () => {

        const tableHeaders = screen.getAllByRole('columnheader');
        expect(tableHeaders).toHaveLength(6);
        expect(tableHeaders[0]).toHaveAccessibleName(/ID/i);
        expect(tableHeaders[1]).toHaveAccessibleName(/User ID/i);
        expect(tableHeaders[2]).toHaveAccessibleName(/Action/i);
        expect(tableHeaders[3]).toHaveAccessibleName(/Timestamp/i);
        expect(tableHeaders[4]).toHaveAccessibleName(/Before/i);
        expect(tableHeaders[5]).toHaveAccessibleName(/After/i);


    })

    it('Renders Table rows', () => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThanOrEqual(1);
        console.log(rows.length);

    })

})