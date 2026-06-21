import { useDispatch, useSelector } from "react-redux";
import { getGithubStatus, disconnectGithub, getGithubConnectUrl } from "../service/github.api";
import { setGithubStatus } from "../../auth/auth.slice";

export function useGithub() {

    const dispatch = useDispatch()
    const github = useSelector((state) => state.auth.github)

    async function handleRefreshStatus() {
        try {
            const data = await getGithubStatus()
            dispatch(setGithubStatus({ connected: data.connected, username: data.username }))
        } catch {
            // leave previous state on failure
        }
    }

    async function handleDisconnect() {
        await disconnectGithub()
        dispatch(setGithubStatus({ connected: false, username: null }))
    }

    function connect() {
        window.location.href = getGithubConnectUrl()
    }

    return {
        github,
        handleRefreshStatus,
        handleDisconnect,
        connect,
    }

}
