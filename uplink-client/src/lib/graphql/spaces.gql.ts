import gql from 'graphql-tag';

export const AllSpacesDocument = gql`
    query Spaces{
        spaces{
            name
            displayName
            members
            admins{
                address
            }
            logoUrl
        }
    }
`;

export const SpaceDocument = gql`
    query Query($name: String, $id: ID){
        space(name: $name, id: $id){
            id
            name
            displayName
            logoUrl
            twitter
            website
            admins{
                address
            }
            contests {
                deadlines {
                  endTime
                  snapshot
                  startTime
                  voteTime
                }
                id
                metadata {
                  category
                }
                promptUrl
              }
        }
    }
`;


export const IsEnsValidDocument = gql`
    query IsEnsValid($ens: String!){
        isEnsValid(ens: $ens){
            success
            errors{
                ens
            }
            ens
        }
    }
`;


export const CreateSpaceDocument = gql`
    mutation CreateSpace($spaceData: SpaceBuilderInput!){
        createSpace(spaceData: $spaceData){
            spaceName
            success
            errors{
                name
                logoUrl
                twitter
                website
                admins
            }
        }
    }
`;

export const EditSpaceDocument = gql`
    mutation EditSpace($spaceId: ID!, $spaceData: SpaceBuilderInput!){
        editSpace(spaceId: $spaceId, spaceData: $spaceData){
            spaceName
            success
            errors{
                name
                logoUrl
                twitter
                website
                admins
            }
        }
    }
`;

