import { Navigate } from "react-router-dom";

function PageNotFound() {
    return (
        <Navigate to={"/"} />
    )
}

export default PageNotFound