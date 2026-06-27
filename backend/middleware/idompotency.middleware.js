let middleware;

async function initializeMiddleware() {
    if (!middleware) {
        const {
            idempotencyMiddleware,
            MemoryStore
        } = await import("express-idempotency-middleware");

        middleware = idempotencyMiddleware({
            store: new MemoryStore(),
            methods: ["POST"],
            requireKey: true
        });
    }

    return middleware;
}

module.exports = async (req, res, next) => {
    const mw = await initializeMiddleware();
    return mw(req, res, next);
};