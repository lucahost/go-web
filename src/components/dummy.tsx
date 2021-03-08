import React, { FC } from 'react'
import styled from 'styled-components'

interface Props {
    text: string
}

const PageTitle = styled.h1`
    color: blue;
`

const Dummy: FC<Props> = props => <PageTitle>{props.text}</PageTitle>

export default Dummy
