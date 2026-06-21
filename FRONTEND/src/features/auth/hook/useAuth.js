import { useDispatch, useSelector } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError, setGithubStatus } from "../auth.slice";
import { resetChat } from "../../chat/chat.slice";

export function useAuth() {

    const dispatch = useDispatch()
    const { user, loading, error, github } = useSelector((state) => state.auth)

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            await register({ email, username, password })
            return true
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
            return true
        } catch {
            // not logged in yet is the expected outcome here, not a user-facing error
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } finally {
            dispatch(setUser(null))
            dispatch(resetChat())
            dispatch(setGithubStatus({ connected: false, username: null }))
        }
    }

    return {
        user,
        loading,
        error,
        github,
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
    }

}
