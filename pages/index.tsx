import * as React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { stringify } from './stringify'

type Answer = {
    name: string
    value: string | number | boolean
}

type State = {
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

const Survey = ({ ...props }) => {
    const [{ nextId, answers }, dispatch] = React.useReducer(reducer, initialState)
    const [successMessageOpen, setSuccessMessageOpen] = React.useState(false)
    const [errorMessageOpen, setErrorMessageOpen] = React.useState(false)
    const { isLoading, isError, data } = useQuery<Array<Question>>({
        queryKey: ['getChatData'],
        queryFn: () => fetch('https://raw.githubusercontent.com/mzronek/task/main/flow.json').then((res) => res.json()),
    })
    const {
        status,
        mutate,
        data: asdf,
    } = useMutation({
        mutationFn: (data: State['answers']) =>
            fetch('https://virtserver.swaggerhub.com/L8475/task/1.0.1/conversation', {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            setSuccessMessageOpen(true)
        },
        onError: () => {
            setErrorMessageOpen(true)
        },
    })

    React.useEffect(() => {
        if (!nextId) {
            mutate(answers)
        }
    }, [nextId, answers, mutate])

    if (isError || !data) {
        return <Alert severity="error">Error Fetching Questions</Alert>
    }

    const questions = Object.fromEntries(data.map((question) => [question.id, question]))

    if (isLoading) {
        return <div>Loading Questions...</div>
    }

    return (
        <Stack spacing={5} alignItems="center" justifyContent="center" sx={{ marginY: 10, marginX: 60 }}>
            {Object.keys(answers).length > 0 && nextId !== initialState.nextId && (
                <Stack spacing={1} sx={{ width: '100%' }}>
                    {Object.keys(answers).map((key) => {
                        const question = questions[key]
                        const answer = answers[Number(key)]

                        if (!question || !answer) {
                            return (
                                <Alert key={key} severity="error">
                                    Error rendering question with id: {key}
                                </Alert>
                            )
                        }

                        return (
                            <Stack key={key} direction="row" justifyContent="space-between">
                                <Typography variant="body1">{question.text}</Typography>
                                <Typography variant="body1">{stringify(answer.value)}</Typography>
                            </Stack>
                        )
                    })}
                </Stack>
            )}
            {nextId ? (
                <FormControl>
                    <Stack spacing={2}>
                        <Typography variant="h5">{questions[nextId].text}</Typography>
                        {questions[nextId].uiType === 'button' ? (
                            <ButtonGroup sx={{ justifyContent: 'center' }}>
                                {questions[nextId].valueOptions.map((option) => (
                                    <Button
                                        key={String(option.value)}
                                        onClick={() =>
                                            dispatch({
                                                type: 'answer',
                                                id: questions[nextId].id,
                                                answer: {
                                                    name: questions[nextId].name,
                                                    value: option.value,
                                                },
                                                nextId: option.nextId,
                                            })
                                        }
                                    >
                                        {option.text}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        ) : (
                            <Alert severity="warning">UI Type {questions[nextId].uiType} not implemented</Alert>
                        )}
                    </Stack>
                </FormControl>
            ) : (
                <Typography variant="h3">Herzlichen Dank für Ihre Angaben</Typography>
            )}
            <Snackbar open={successMessageOpen} autoHideDuration={2000} onClose={() => setSuccessMessageOpen(false)}>
                <Alert severity="success">Daten erfolgreich gespeichtert</Alert>
            </Snackbar>
            <Snackbar open={errorMessageOpen} autoHideDuration={2000} onClose={() => setErrorMessageOpen(false)}>
                <Alert severity="error">Error saving data to server</Alert>
            </Snackbar>
        </Stack>
    )
}

export default Survey
