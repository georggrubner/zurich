import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

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

export default ({ ...props }) => {
    const { isLoading, error, data } = useQuery({
        queryKey: ['getChatData'],
        queryFn: () => fetch('https://raw.githubusercontent.com/mzronek/task/main/flow.json').then((res) => res.json()),
    })
    const [{ nextId, answers }, dispatch] = React.useReducer(reducer, initialState)

    if (isLoading) {
        return <div>Loading Data...</div>
    }

    return (
        <Stack spacing={5} alignItems="center" justifyContent="center" sx={{ m: 10 }}>
            <Stack>
                <div>previous answer1</div>
                <div>previous answer2</div>
            </Stack>
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
