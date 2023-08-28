import React, { useEffect, useState } from "react";
import ParticlesBg from "particles-bg";

import {
  Appcontainer,
  Container,
  GameTitle,
  GameDescription,
  Header,
  TextWithShadow,
  GameContainer,
  Footer,
  DivFooter,
  FooterText,
  JoinRoomButton,
  JoinRoomForm,
  JoinRoomInput,
  LeaveRoomButton,
  StyledLink,
} from "./custom-styles";

import { io } from "socket.io-client";
import GameContext, { IGameContextProps } from "./gameContext";
import GameContent from "./content/game";
import socketService from "./service/socket";
import gameService from "./service/game";

const App = () => {
  const currentYear = new Date().getFullYear();
  const [roomName, setRoomName] = useState("");
  const [isJoining, setJoining] = useState(false);
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [isWaiting, setWaiting] = useState(false);
  const [error, seterror] = useState(null);
  const [data, setdata] = useState(null);

  const connectSocket = async () => {
    const socket = await socketService
      .connect("https://xos.onrender.com/")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    isWaiting,
    setWaiting,
    data,
    setdata,
    roomName,
  };

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    const joined = await gameService
      .joinGameRoom(socket, roomName)
      .catch((err) => {
        seterror(err);
      });

    console.log(joined);

    if (joined) {
      setInRoom(true);
      setWaiting(true);
      const res = await gameService.onGameStarted(
        socketService.socket,
        (data) => {
          console.log("inside 3");
          console.log(data);
          if (data) {
            setdata(data);
            setPlayerSymbol(data.symbol);
            setPlayerTurn(data.start);
          }
        }
      );
    }

    setJoining(false);

    setTimeout(() => {
      seterror(null);
    }, 5000);
  };

  const leaveRoom = () => {
    const socket = socketService.socket;
    if (!socket) return;

    gameService.leave(socket, roomName);
    setGameStarted(false);
    setPlayerTurn(false);
    setPlayerSymbol("");
    setInRoom(false);
    setWaiting(false);
    setdata(null);

    alert("You have left the room !");
  };

  return (
    <>
      <GameContext.Provider value={gameContextValue}>
        <Appcontainer>
          <ParticlesBg type="cobweb" bg={true} />
          <Container>
            <Header>
              <GameTitle>
                <TextWithShadow>
                  {playerSymbol !== ""
                    ? `PLAYER ${playerSymbol?.toUpperCase()} `
                    : "XO-CLASH"}
                </TextWithShadow>
              </GameTitle>
              <GameDescription>
                {!isGameStarted ? (
                  <span className={!error ? "blinking-text" : "error"}>
                    {error ? error : "Invite your mate and kick his ass !"}
                  </span>
                ) : (
                  <span className={"blinking-text"}>
                    {isPlayerTurn ? "Your turn" : "Waiting your rival to draw"}
                  </span>
                )}
              </GameDescription>
            </Header>

            <GameContainer>
              {!isGameStarted && (
                <JoinRoomForm onSubmit={joinRoom}>
                  {isJoining && (
                    <>
                      <span className="Joining-text">Joining </span>

                      <span className=" Joining-text Joining-points">...</span>
                    </>
                  )}
                  {!isInRoom && !isJoining && !isWaiting && (
                    <>
                      <JoinRoomInput
                        type="text"
                        name="room"
                        onChange={handleRoomNameChange}
                      />
                      <JoinRoomButton type="submit">
                        <img
                          src="https://img.icons8.com/external-bearicons-detailed-outline-bearicons/64/F8B500/external-Join-social-media-bearicons-detailed-outline-bearicons.png"
                          alt="join"
                        />
                      </JoinRoomButton>
                    </>
                  )}
                  {!isJoining && isWaiting && (
                    <>
                      <span className="Joining-text">Waiting for opponent</span>

                      <span className=" Joining-text Joining-points">...</span>
                    </>
                  )}
                </JoinRoomForm>
              )}

              <GameContent />
            </GameContainer>
          </Container>

          <DivFooter>
            &copy; {currentYear} &nbsp;
            <StyledLink
              href="https://kmaar.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abhishek Kumar
            </StyledLink>
            . All rights reserved. | Powered by &nbsp;
            <StyledLink
              href="https://kmstudio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              KMaar Miscellaneous Studio
            </StyledLink>
          </DivFooter>
          {isInRoom && (
            <LeaveRoomButton onClick={leaveRoom} disabled={!isInRoom}>
              <img
                src="https://img.icons8.com/material-sharp/28/ff6347/export.png"
                alt="leave"
              />
            </LeaveRoomButton>
          )}
        </Appcontainer>
      </GameContext.Provider>
    </>
  );
};

export default App;
