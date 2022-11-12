import { useQuery } from '@tanstack/react-query'

export default ({ ...props }) => {
    const { isLoading, error, data } = useQuery({
        queryKey: ['getChatData'],
        queryFn: () => fetch('https://raw.githubusercontent.com/mzronek/task/main/flow.json').then((res) => res.json()),
    })

    if (isLoading) {
        return <div>Loading Data...</div>
    }

    return <div>{JSON.stringify(data)}</div>
}
