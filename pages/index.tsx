import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { stringify } from './stringify'

type Action = { type: 'reset' }

export const initialState = {
    nextId: 100,
    answers: {},
}

type State = {
    nextId: number
    answers: {
        [key: number]: {
            name: string
            value: string | number | boolean
        }
    }
}

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'reset': {
            return initialState
        }
    }
}

type Question = {
    id: number
    name: string
    text: string
    uiType: 'button'
    valueType: 'boolean' | 'number' | 'string'
    valueOptions: Array<{
        nextId: number | false
        value: boolean | number | string
        text: string
    }>
}

export default ({ ...props }) => {
    const {
        isLoading,
        isError,
        data: questions,
    } = useQuery<Array<Question>>({
        queryKey: ['getChatData'],
        queryFn: () => fetch('https://raw.githubusercontent.com/mzronek/task/main/flow.json').then((res) => res.json()),
    })
    const [{ nextId, answers }, dispatch] = React.useReducer(reducer, initialState)

    if (isLoading) {
        return <div>Loading Questions...</div>
    }

    if (isError || !questions) {
        return <Alert severity="error">Error Fetching Questions</Alert>
    }

    return (
        <Stack spacing={5} alignItems="center" justifyContent="center" sx={{ m: 10 }}>
            {Object.keys(answers).length > 0 && nextId !== initialState.nextId && (
                <Stack sx={{ width: '100%' }}>
                    {Object.keys(answers).map((keystring) => {
                        const key = Number(keystring)
                        const question = questions.filter(({ id }) => id === key)[0]

                        if (!question) {
                            return <Alert severity="error">Error rendering question with id: {keystring}</Alert>
                        }

                        return (
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body1">{question.text}</Typography>
                                <Typography variant="body1">{stringify(answers[key].value)}</Typography>
                            </Stack>
                        )
                    })}
                </Stack>
            )}
            <FormControl>
                <Stack spacing={2}>
                    <FormLabel htmlFor="buttongroup">Lange lange lange lange lange lange lange Frage?</FormLabel>
                    <ButtonGroup id="buttongroup" sx={{ justifyContent: 'center' }} aria-labelledby="buttongroup">
                        <Button>One</Button>
                        <Button>Two</Button>
                    </ButtonGroup>
                </Stack>
            </FormControl>
        </Stack>
    )
}
