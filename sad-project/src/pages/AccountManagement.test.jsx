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

        const acctmgmtButton = screen.getByRole('button', {name: /👤 Account Management/i});
        await user.click(acctmgmtButton);
        renderwithRouter(<AccountManagement/>);
        await delay(2000);


        expect(screen.getByRole('heading', { name: /Administrator Account Management/i}));
        expect(screen.getByText("User Management")).toBeInTheDocument();

    })

    it('Renders user management table components', () => {
        console.debug(prettyDOM())
        expect(screen.getByRole("button", { name: /Create New User/i})).toBeInTheDocument();

        const editbuttons = screen.getAllByRole("button", { name: /Edit/i});
        expect(editbuttons).not.toHaveLength(0);
        console.log(editbuttons.length);

        const deactbuttons = screen.getAllByRole("button", { name: /Deactivate/i});
        expect(deactbuttons).not.toHaveLength(0);
        console.log(deactbuttons.length);

        const suspendbuttons = screen.getAllByRole("button", { name: /Suspend/i});
        expect(suspendbuttons).not.toHaveLength(0);
        console.log(suspendbuttons.length);

        const emailbuttons = screen.getAllByRole("button", { name: /Email/i});
        expect(emailbuttons).not.toHaveLength(0);
        console.log(emailbuttons.length);


        const tableHeads = screen.getAllByRole('columnheader');
        expect(tableHeads[0]).toHaveAccessibleName('Username');
        expect(tableHeads[1]).toHaveAccessibleName('Email');
        expect(tableHeads[2]).toHaveAccessibleName('Role');
        expect(tableHeads[3]).toHaveAccessibleName('Status');



    })

    it('Render Account Management TextFields & Comboboxes', () => {
        expect(screen.getByRole('textbox', { name: /account Name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'account Number' } )).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'description' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'category' } )).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'subcategory' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name:'initial Balance' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'debit' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'credit' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'balance' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'user Id' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'order' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'comment' })).toBeInTheDocument();
        expect(screen.getAllByRole('combobox')).toHaveLength(2);


    })

    it('Render Account Management Text & Button', () => {
        expect(screen.getByText('Existing Accounts')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Account/i })).toBeInTheDocument();

    })

    it('Render Account Management table headers', () => {
        const tableHeads = screen.getAllByRole('columnheader');
        expect(tableHeads[5]).toHaveAccessibleName('Account Number');
        expect(tableHeads[6]).toHaveAccessibleName('Account Name');
        expect(tableHeads[7]).toHaveAccessibleName('Account Type');
        expect(tableHeads[8]).toHaveAccessibleName('Subcategory');
        expect(tableHeads[9]).toHaveAccessibleName('Balance');
        expect(tableHeads[10]).toHaveAccessibleName('Created By');
        expect(tableHeads[11]).toHaveAccessibleName('Date Created');
        expect(tableHeads[12]).toHaveAccessibleName('Comments');



    })



})