import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.module.css'
// import App from './App.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import axios from 'axios';
import { List } from './pages/List/List';
import { ErrorPage } from './pages/ErrorPage/ErrorPage';
import { Stats } from './pages/Stats/Stats';
import { Item } from './pages/Item/Item';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Navigate to="/list" replace />
      },
      {
        path: '/list',
        element: <List />
      },
      {
        path: '/item/:id',
        element: <Item />,
        errorElement: <ErrorPage />,
        loader: async ({ params }) => {
          const { data } = await axios.get(`${import.meta.env.API_URL_FRON}/items/${params.id}`);
          return data;
        }
      },
      {
        path: '/stats',
        element: <Stats />
      }
    ]
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router}/>
	</StrictMode>
);