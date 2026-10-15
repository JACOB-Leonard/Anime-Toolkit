import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface VoiceActorAnime {
  id: number;
  idMal: number | null;
  type: string;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  status: string;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  popularity: number | null;
  favourites: number | null;
  coverImage?: {
    large: string | null;
    medium: string | null;
  };
}

export interface VoiceActorCharacter {
  id: number;
  name: {
    full: string;
    native: string;
  };
  image: {
    large: string;
    medium: string;
  };
  favourites: number;
  media: {
    nodes: VoiceActorAnime[];
  };
}

interface VoiceActorCharacterMediaEdge {
  characterRole: string;
  node: VoiceActorAnime;
}

interface VoiceActorCharacterResponse
  extends Omit<VoiceActorCharacter, 'media'> {
  media: {
    edges: VoiceActorCharacterMediaEdge[];
  };
}

interface VoiceActorPopularCharactersResponse {
  Staff: {
    characters: {
      edges: {
        role: string;
        node: VoiceActorCharacterResponse;
      }[];
      pageInfo: {
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
    };
  };
}

interface VoiceActorRecentCharacterResponse
  extends Omit<VoiceActorCharacter, 'media'> {}

export interface VoiceActorRecentCharacter {
  character: VoiceActorCharacter;
  anime: VoiceActorAnime;
}

export interface VoiceActorCharacterList {
  nodes: VoiceActorCharacter[];
  pageInfo: {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}

export interface VoiceActorRecentCharacterList {
  items: VoiceActorRecentCharacter[];
  pageInfo: {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}

interface AniListResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class VoiceActorService {
  private readonly http = inject(HttpClient);
  private readonly aniListUrl = 'https://graphql.anilist.co';

  getPopularCharacters(
    staffId: number,
    page = 1,
    perPage = 25
  ): Observable<VoiceActorCharacterList> {
    const query = `
      query ($staffId: Int!, $page: Int!, $perPage: Int!) {
        Staff(id: $staffId) {
          id
          characters(
            page: $page
            perPage: $perPage
            sort: FAVOURITES_DESC
          ) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
                favourites
                media(
                  type: ANIME
                  sort: POPULARITY_DESC
                  page: 1
                  perPage: 2
                ) {
                  edges {
                    characterRole
                    node {
                      id
                      idMal
                      type
                      title {
                        romaji
                        english
                        native
                      }
                      status
                      popularity
                      favourites
                      startDate {
                        year
                        month
                        day
                      }
                      coverImage {
                        large
                        medium
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              currentPage
              lastPage
              hasNextPage
            }
          }
        }
      }
    `;
    return this.http.post<AniListResponse<VoiceActorPopularCharactersResponse>>(
      this.aniListUrl,
      {
        query,
        variables: { staffId, page, perPage }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    ).pipe(
      map(response => {
        const characters = response.data.Staff.characters;

        return {
          nodes: characters.edges.map(edge => {
            const media = edge.node.media.edges;
            const selectedAnime =
              media[0]?.characterRole === 'BACKGROUND'
                ? media[1]?.node
                : media[0]?.node;

            return {
              ...edge.node,
              media: {
                nodes: selectedAnime ? [selectedAnime] : []
              }
            };
          }),
          pageInfo: characters.pageInfo
        };
      })
    );
  }

  getRecentCharacters(
    staffId: number,
    page = 1,
    perPage = 20
  ): Observable<VoiceActorRecentCharacterList> {
    const query = `
      query ($staffId: Int!, $page: Int!, $perPage: Int!) {
        Staff(id: $staffId) {
          characterMedia(
            page: $page
            perPage: $perPage
            sort: START_DATE_DESC
          ) {
            edges {
              node {
                id
                idMal
                type
                title {
                  romaji
                  english
                  native
                }
                status
                startDate {
                  year
                  month
                  day
                }
                popularity
                favourites
                coverImage {
                  large
                  medium
                }
              }
              characters {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
                favourites
              }
            }
            pageInfo {
              currentPage
              lastPage
              hasNextPage
            }
          }
        }
      }
    `;
    return this.http.post<
      AniListResponse<{
        Staff: {
          characterMedia: {
            edges: {
              node: VoiceActorAnime;
              characters: VoiceActorRecentCharacterResponse[];
            }[];
            pageInfo: {
              currentPage: number;
              lastPage: number;
              hasNextPage: boolean;
            };
          };
        };
      }>
    >(
      this.aniListUrl,
      {
        query,
        variables: { staffId, page, perPage }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    ).pipe(
      map(response => {
        const media = response.data.Staff.characterMedia;
        const items: VoiceActorRecentCharacter[] = [];

        for (const edge of media.edges) {
          if (edge.node.type !== 'ANIME') continue;

          if (
            edge.node.status !== 'FINISHED' &&
            edge.node.status !== 'RELEASING'
          ) {
            continue;
          }

          for (const character of edge.characters) {
            items.push({
              character: {
                ...character,
                media: { nodes: [] }
              },
              anime: edge.node
            });
          }
        }

        const uniqueCharacters = new Map<number, VoiceActorRecentCharacter>();

        for (const item of items) {
          if (!uniqueCharacters.has(item.character.id)) {
            uniqueCharacters.set(item.character.id, item);
          }
        }

        return {
          items: [...uniqueCharacters.values()],
          pageInfo: media.pageInfo
        };
      })
    );
  }
}