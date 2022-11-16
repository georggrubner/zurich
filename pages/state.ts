type Answer = {
    name: string
    value: string | number | boolean
}

export type State = {
    nextId: number | false
    answers: {
        [key: number]: Answer
    }
}

type Action = { type: 'reset' } | { type: 'answer'; id: number; answer: Answer; nextId: number | false }

export const initialState = {
    nextId: 100,
    answers: {},
}

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'reset': {
            return initialState
        }
        case 'answer': {
            return {
                nextId: action.nextId,
                answers: { ...state.answers, [action.id]: action.answer },
            }
        }
    }
}
