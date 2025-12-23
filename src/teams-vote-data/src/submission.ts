import { Deck } from "./deck"
import { User } from "./user";

export type Submission<T extends Deck> = {
    score: (T extends 't-shirt' ? string : number) | 'skip' | '?'
    user: User;
}