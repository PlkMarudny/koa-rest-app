export class DBDoesNotExistError extends Error {
    constructor(message, metadata) {
        super(message);
        this.name = "DatabaseError";
        this.metadata = metadata;
    }
}