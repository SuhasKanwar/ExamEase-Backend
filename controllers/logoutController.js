exports.logoutHandler = (req, res) => {
    res.clearCookie("token").json(
        {
            success: true,
            message: "Logout Successful",
        },
        {
            status: 200,
        }
    );
}