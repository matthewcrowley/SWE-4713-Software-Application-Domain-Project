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
import Regularaccountuser from "./regularaccountuser.jsx";
import Accountview from "./Accountview.jsx";

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
        renderwithRouter(<Regularaccountuser setIsLoggedIn={true}/>);
        const user = userEvent.setup()

        const acctmgmtButton = screen.getByRole('button', {name: /👤 Account Management/i});
        await user.click(acctmgmtButton);
        renderwithRouter(<Accountview/>);
        await delay(2000);


        expect(screen.getByRole('heading', { name: /Account View/i}));
        expect(screen.getByText("Account View")).toBeInTheDocument();

    })

    it('Renders user management table components', () => {
        console.debug(prettyDOM())
        expect(screen.queryByRole("button", { name: /Create New User/i})).not.toBeInTheDocument();


        const tableHeads = screen.getAllByRole('columnheader');
        expect(tableHeads[0]).toHaveAccessibleName('Username');
        expect(tableHeads[1]).toHaveAccessibleName('Email');
        expect(tableHeads[2]).toHaveAccessibleName('Role');
        expect(tableHeads[3]).toHaveAccessibleName('Status');



    })

    it('Render Account Management Text & Button', () => {
        expect(screen.queryByText('Existing Accounts')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Add Account/i })).not.toBeInTheDocument();

    })



})