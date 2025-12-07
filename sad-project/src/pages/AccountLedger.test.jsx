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
import AccountLedger from "./AccountLedger.jsx";
import Manager from "./manager.jsx";

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


describe('Account Ledger Page', () => {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    it('Renders without crashing', async () => {
        renderwithRouter(<Manager setIsLoggedIn={true}/>);
        const user = userEvent.setup()

        const acctLedgerButton = screen.getAllByRole('button', {name: /Access Service/i});
        console.log(acctLedgerButton.length);
        await user.click(acctLedgerButton[7]);
        renderwithRouter(<AccountLedger/>);
        await delay(1750);

        console.debug(prettyDOM()) //render method to be researched more

        //There is no screen for acccount ledger so this test will be left as it is here.
        //Look for the Ledger.Test.jsx

    })

    it('Renders major elements', () => {


    })



})