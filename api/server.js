// See https://github.com/typicode/json-server#module
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
// Add this before server.use(router)

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

server.use((req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
        if (!validateEmail(req.body.email)) {
            return res.status(422).send({
                error: {
                    email: "Email không đúng định dạng",
                },
            });
        }
        if (req.body.last_name === "admin") {
            return res.status(500).send({
                error: "Server bị lỗi",
            });
        }
    }
    setTimeout(() => {
        next();
    }, DELAY);
});
router.render = (req, res) => {
    let data = res.locals.data;
    const { originalUrl } = req;
    if (req.method === "GET" && (originalUrl === "/students" || /^\/students\?.*$/.test(originalUrl))) {
        data = data.map((student) => ({
            id: student.id,
            avatar: student.avatar,
            last_name: student.last_name,
            email: student.email,
        }));
    }
    res.jsonp(data);
};

server.use(
    jsonServer.rewriter({
        "/api/*": "/$1",
        "/students/:resource/:id/show": "/:resource/:id",
    })
);

server.use(router);

server.listen(3000, () => {
    console.log("JSON Server is running");
});

// Export the Server API
module.exports = server;
