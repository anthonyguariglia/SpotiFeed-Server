# SpotiFeed
By Anthony Guariglia

## Overview

This application provides a way for Spotify users to see the recent uploads of their followed artists in a news-feed style display. Once signed in, the app allows the user to log into their Spotify account and then pulls their followed artists, finds their most recent singles and albums, and displays them in descending chronological order.

Once the most recent tracks have been pulled, the user is able to create their own playlists to store their favorite tracks. They can name their playlists as they like, add and remove songs and albums as they please, and their playlists will remain unchanged as their recent uploads evolve over time.

The end result is an app that lets users stay up-to-date with their favorite artists without the hassle of checking in on them one at a time.

## Planning

### Entity Relationship Diagram (ERD)

![Entity Relationship Diagram](./../spotifeed/public/ERD.png)

### Entity Explanation

Each user is able to create an account with SpotiFeed. That account is not tied to their Spotify account until the user logs into Spotify, and none of the user's Spotify information is permanently saved to their SpotiFeed account. The SpotiFeed account simply stores the user's email, password, and login authentication token.

Once logged into a Spotify account, the user model contains the artists they follow, and allows them to add those artists' recently uploaded tracks to playlists they can create. They can make as many as they want, and give them unique names, populate them with any track on their feed, and remove any track they no longer want. Any playlist can also be deleted by clicking on the garbage icon next to the name of the playlist.

In order to populate the feed, every artist that the user follows is pulled from their Spotify account, and those Spotify artist IDs are then used to pull the artist's most recent albums and singles. This is done for all of the artists the user follows to obtain all recent upload data. That data is then sorted in descending chronological order based on release date and displayed on the screen. The albums are populated with all relevant information to provide the user with the album name, artist(s) name(s), number of days since release, and album artwork. 

Artist models are also created for each artist, containing the artist's name and Spotify ID, as well as their recent albums. 

With all of this data accumulated, the user becomes the direct and sole owner of their playlists, with all tracks in them, as well as their recent uploads list. The recent uploads list will change upon each reload of the app and occurrence of clicking 'Get Latest Data', but the songs in the playlists will remain for as long as they are still on Spotify. While the user doesn't 'own' any of the albums or artists, they own their specific collection of those artists and albums within their feed and playlists.

#### Link to Deployed Project

https://anthonyguariglia.github.io/SpotiFeed-Client/
