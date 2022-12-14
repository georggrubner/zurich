import * as React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Skeleton from '@mui/material/Skeleton'
import { reducer, initialState, State } from '../store/state'

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
    const [mutateStatus, setMutateStatus] = React.useState<'success' | 'error' | undefined>()
    const { isLoading, isError, data } = useQuery<Array<Question>>({
        queryKey: ['getChatData'],
        queryFn: () => fetch('https://raw.githubusercontent.com/mzronek/task/main/flow.json').then((res) => res.json()),
    })
    const { status, mutate } = useMutation({
        mutationFn: (data: State['answers']) =>
            fetch('https://virtserver.swaggerhub.com/L8475/task/1.0.1/conversation', {
                method: 'PUT',
                body: JSON.stringify(Object.values(answers)),
            }),
        onSuccess: () => {
            setMutateStatus('success')
        },
        onError: () => {
            setMutateStatus('error')
        },
    })

    React.useEffect(() => {
        if (!nextId) {
            mutate(answers)
        }
    }, [nextId, answers, mutate])

    if (isError) {
        return <Alert severity="error">Error Fetching Questions</Alert>
    }

    const questions = data ? Object.fromEntries(data.map((question) => [question.id, question])) : undefined

    return (
        <Box
            justifyContent="center"
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', rowGap: 8 }}
            margin={10}
        >
            {isLoading || !questions ? (
                <Stack sx={{ gridColumn: 2 }} spacing={2}>
                    <Skeleton variant="rounded" height={40} />
                    <Stack direction="row" justifyContent="center">
                        <Skeleton variant="rounded" height={30} width={60} />
                        <Skeleton variant="rounded" height={30} width={60} />
                    </Stack>
                </Stack>
            ) : (
                <>
                    {Object.keys(answers).length > 0 && nextId !== initialState.nextId && (
                        <Stack sx={{ gridColumn: 2 }} spacing={2}>
                            {Object.keys(answers).map((key) => {
                                const question = questions[key]
                                const answer = question.valueOptions.find(
                                    ({ value }) => value === answers[Number(key)].value,
                                )

                                if (!question || !answer) {
                                    return (
                                        <Alert key={key} severity="error">
                                            Error rendering question with id: {key}
                                        </Alert>
                                    )
                                }

                                return (
                                    <Stack
                                        key={key}
                                        direction={{ md: 'column', lg: 'row' }}
                                        justifyContent="space-between"
                                    >
                                        <Typography variant="body1">{question.text}</Typography>
                                        <Typography variant="body1" textAlign="right">
                                            {answer.text}
                                        </Typography>
                                    </Stack>
                                )
                            })}
                        </Stack>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gridColumn: 2 }} textAlign="center">
                        {nextId ? (
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
                        ) : (
                            <Typography variant="h3">Herzlichen Dank f??r Ihre Angaben</Typography>
                        )}
                    </Box>
                    <Snackbar
                        open={mutateStatus && ['success', 'error'].includes(mutateStatus)}
                        autoHideDuration={5000}
                        onClose={() => setMutateStatus(undefined)}
                    >
                        <Alert severity={mutateStatus}>
                            {mutateStatus === 'success'
                                ? 'Daten erfolgreich gespeichtert'
                                : 'Fehler beim Speichern der Daten'}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </Box>
    )
}

export default Survey
