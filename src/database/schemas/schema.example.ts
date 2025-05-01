import mongoose from 'mongoose';

export interface Example extends mongoose.Document {
    string: string;
    number: number;
    boolean: boolean;
    object: ExampleObject;
}

export interface ExampleObject {
    string: string;
    number: number;
    boolean: boolean;
}

const ExampleSchema = new mongoose.Schema({
    string: String,
    number: Number,
    boolean: Boolean,
    object: {
        string: String,
        number: Number,
        boolean: Boolean
    }
});

export const Example = mongoose.model<Example>('ExampleSchema', ExampleSchema);
