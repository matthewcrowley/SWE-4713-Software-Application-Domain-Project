import ReactDOMClient from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route, useNavigate, Navigate, MemoryRouter} from "react-router-dom";
import '@testing-library/jest-dom/vitest'
import {render, screen} from '@testing-library/react';
import App from './App.jsx'
import {describe, it, expect, test, afterEach,beforeAll,beforeEach,afterAll, cleanup, first, vi} from 'vitest';

