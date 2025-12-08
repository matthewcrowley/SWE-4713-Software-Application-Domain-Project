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
import {
    findAllByAltText,
    getAllByRole,
    prettyDOM,
    render,
    screen,
    waitFor
} from '@testing-library/react';
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


const renderwithRouter = (component) => {
    return(
        render(<BrowserRouter>
        {component}
    </BrowserRouter>)
    )


}


describe('Chart of Accounts Page', () => {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    it('Renders without crashing', async () => {
        renderwithRouter(<Administrator/>)
        const user = userEvent.setup()

        const cofaButton = screen.getByRole('button', { name: /📋 Chart of Accounts/i });
        await user.click(cofaButton);
        renderwithRouter(<Chartofaccounts />)
        await delay(2000);


        expect(screen.getByText("Search and Filter Accounts")).toBeInTheDocument();
        expect(screen.getByText("Manage your accounts here.")).toBeInTheDocument()

    })

    it('Render header for Chart of Accounts', async () => {
        expect(screen.getAllByRole('heading', { name: /Chart of Accounts/i})).toHaveLength(3);
        expect(screen.getByRole("button", {name: /✉️/i})).toBeInTheDocument();
        expect(screen.getAllByRole("button", {name: '?'})).toHaveLength(2);


    })

    it('Render Search and Filter Accounts', () => {
       expect(screen.getByRole('heading', { name: /Search and Filter Accounts/i})).toBeInTheDocument();
       expect(screen.getByRole('combobox')).toBeInTheDocument();
       expect(screen.getByPlaceholderText('Search all fields...')).toBeInTheDocument();
       expect(screen.getByRole('button', { name: /Search/i})).toBeInTheDocument();
        expect(screen.getByText('Select a filter type and enter a search term to find accounts.')).toBeInTheDocument();

    })

    it('Render Text & Buttons for Chart of Accounts', () => {

        expect(screen.getByRole('button', { name: /Add Account/i})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Accounts Report/i})).toBeInTheDocument();

        expect(screen.getByText('Manage your accounts here.')).toBeInTheDocument();
    })

    it('Render Table for Chart of Accounts', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
    })

    it('Ensure multiple rows in Chart of Accounts', () => {

        expect(screen.getAllByRole('row')).not.toHaveLength(0);

    })

    it('Render Chart of Accounts Table Headers', () => {
        const tableHeaders = screen.getAllByRole('columnheader')
        expect(tableHeaders[0]).toHaveAccessibleName('Select to Edit');
        expect(tableHeaders[1]).toHaveAccessibleName(/Account Number/i);
        expect(tableHeaders[2]).toHaveAccessibleName(/Account Name/i);
        expect(tableHeaders[3]).toHaveAccessibleName(/Account Type/i);
        expect(tableHeaders[4]).toHaveAccessibleName(/Subcategory/i);
        expect(tableHeaders[5]).toHaveAccessibleName(/Balance/i);
        expect(tableHeaders[6]).toHaveAccessibleName(/Created By/i);
        expect(tableHeaders[7]).toHaveAccessibleName(/Date Created/i);
        expect(tableHeaders[8]).toHaveAccessibleName(/Comments/i);



    })

})