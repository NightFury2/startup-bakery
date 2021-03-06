import React, { useState, useEffect } from "react";
import { useUser } from "../containers/UserContext";
import {
  Descriptions,
  Avatar,
  Card,
  List,
  Statistic,
  Layout,
  Skeleton,
} from "antd";
import Page from "../containers/Page";
import * as firebase from "firebase";
import "../styles/main.scss";

const { Sider, Content } = Layout;
const { Countdown } = Statistic;

const TIMER_DEADLINE = Date.now() + 1000 * 60 * 60 * 2;

const sortByAmount = (toSort) =>
  toSort.sort ? toSort.sort((a, b) => (a.amount < b.amount ? 1 : -1)) : toSort;

const InvestorsList = ({ players, isLoading }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={isLoading ? [] : sortByAmount(players)}
      renderItem={(item, idx) => (
        <List.Item key={idx}>
          {isLoading ? (
            <List.Item.Meta
              avatar={<Skeleton.Avatar active />}
              title={<Skeleton active />}
              description={<Skeleton active />}
            />
          ) : (
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={item.title}
              description={"$" + item.amount}
            />
          )}
        </List.Item>
      )}
    />
  );
};

const Auction = () => {
  const [topPlayer, setTopPlayer] = useState();
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUser();

  let player = !user
    ? null
    : {
        title: user.name,
        avatar: user.picture,
        email: user.email,
        amount: 0,
        rating: "",
        role: "",
      };

  function regUser(user) {
    if (players.length > 0) {
      return firebase.database().ref(`/users/${players.length}`).set(user);
    }
    return null;
  }

  useEffect(() => {
    setTimeout(() => {
      firebase
        .database()
        .ref("/users")
        .orderByChild("amount")
        .once("value")
        .then((snapshot) => {
          const playersNew = snapshot.val().reverse();
          setPlayers(playersNew);
          setIsLoading(false);
        });
    }, 10);
  }, []);

  useEffect(() => {
    setTopPlayer(sortByAmount(players)[0]);
    const autheduser = players.find((p) => p.email === player.email);
    if (user && !autheduser) {
      regUser(player);
    } else {
      console.log("settingUser", autheduser);
      player = autheduser;
    }
  }, [players]);

  const onRaiseBet = () => {
    if (!player) return;
    player.amount += 1000;
    const newPlayers = [...players];
    setPlayers(sortByAmount(newPlayers));
  };

  return (
    <Page>
      <Layout className="bg-white">
        <Sider id="sidebar">
          <Card className="border-bottom-0 h-100 rounded-0">
            <h5 className="auction__sidebar_title">Инвесторы </h5>
            <InvestorsList players={players} isLoading={isLoading} />
          </Card>
        </Sider>

        <Content className="auction__top bg">
          <div className="row bets__card">
            <div className="col-8 bets__project">
              <div className="bets__project__info">
                <div className="row">
                  <div className="col-4">
                    <img width="150px" src="/icons/pizza.svg" />
                  </div>
                  <div className="col-8 text-left">
                    <b>Startup Bakery</b>
                    <p>
                      Startup Bakery - уникальная площадка, где каждый может
                      разместить свою проектную идею и довести ее результата.
                      Присоединяйся к Startup Bakery, и с нашей помощью ты
                      сможешь “выпечь” свой стартап, пройдя самые трудные этапы,
                      на которых чаще всего перегорают проекты.
                    </p>
                  </div>
                </div>
              </div>
              <div className="container bets__project__menu">
                <div className="row">
                  <div className="col-4">
                    <div className="bets__project__title">Статус проекта</div>
                  </div>
                  <div className="col-8">
                    Команда распределила <b>задачи</b>, проверила
                    <b> гипотезы</b> и приступает к разработке <b>прототипа</b>.
                  </div>
                </div>
                <div className="row">
                  <div className="col-4">
                    <div className="bets__project__title">Таймер</div>
                  </div>
                  <div className="col-8">
                    До следующего раунда осталось:
                    <span className="font-weight-bold">
                      <Descriptions.Item label="Таймер">
                        <small>
                          <Countdown
                            valueRender={(element) => {
                              return (
                                <div>
                                  <span className="font-weight-bold">
                                    {element}
                                  </span>
                                </div>
                              );
                            }}
                            valueStyle={{ fontSize: "small" }}
                            value={TIMER_DEADLINE}
                            format="D дней H часов m минут s секунд"
                          />
                        </small>
                      </Descriptions.Item>
                    </span>
                  </div>
                </div>

                <div className="row">
                  <div className="col-4">
                    <div className="bets__project__title">Команда</div>
                  </div>
                  <div className="col-8">
                    <b>Seals</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4 bets__profile px-sm-1">
              <div className="bets__title">Топ инвестор</div>
              {!isLoading ? (
                <>
                  <Avatar src={topPlayer.avatar} size={156} />
                  <div className="bets__profile__content">
                    <h5>{topPlayer.title}</h5>
                    <p>{topPlayer.role}</p>
                    <div className="bets__max">
                      <b> Сумма инвестиций: </b> ${topPlayer.amount}
                    </div>
                  </div>
                  {player && (
                    <a
                      onClick={onRaiseBet}
                      className="btn btn-primary btn-gradient w-auto mb-4 px-lg-3 px-auto"
                    >
                      Поднять ставку
                    </a>
                  )}
                </>
              ) : (
                <>
                  <Skeleton.Avatar active size={156} />
                  <div className="bets__profile__content">
                    <h5>
                      <Skeleton active />
                    </h5>
                  </div>
                  <Skeleton.Button active shape="round" className="w-100" />
                </>
              )}
            </div>
          </div>
        </Content>
      </Layout>
    </Page>
  );
};

export default Auction;
