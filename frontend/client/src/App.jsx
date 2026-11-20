import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard.jsx";
import Layout from "./components/Layout.jsx";
import AuthPage from "./pages/Auth.jsx";
import ClassesPage from "./pages/Classes.jsx";
import DirectoryPage from "./pages/Directory.jsx";
import StudentsPage from "./pages/Students.jsx";
import TeachersPage from "./pages/Teachers.jsx";
import UsersPage from "./pages/Users.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth" element={<AuthPage />} />

                <Route element={<AuthGuard />}>
                    <Route element={<Layout />}>
                        <Route index element={<Navigate to="/directory" replace />} />
                        <Route path="/directory" element={<DirectoryPage />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/teachers" element={<TeachersPage />} />
                        <Route path="/classes" element={<ClassesPage />} />
                        <Route path="/users" element={<UsersPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/directory" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
