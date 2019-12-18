import styled from "styled-components";
import React, { useState, useContext, useEffect } from "react";
import ButtonSelect from "../../components/Atoms/SelectOptionButton";
import ButtonDays from "../../components/Atoms/DayButton";
import Header from "../../components/Atoms/Header";
import Footer from "../../components/Atoms/Footer";
import TradeListBox from "../../components/Organism/TradeListBox";

import userContext from "../../context/UserContext";

import apiConfig from "../../config/api";
import pathConfig from "../../config/path";

const { apiUrl } = apiConfig;
const { logfilter } = pathConfig;

const Wraper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const TradeWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 90%;
  height: 100%;
`;

const RightAlign = styled.div`
  display: flex;
  justify-content: flex-end;
  height: 2rem;
  margin: 0 0 0.5rem;
`;
const LeftRightAlign = styled.div`
  display: flex;
  justify-content: space-between;
  height: 2rem;
  margin: 0 0 0.5rem;
`;
const TradeContents = styled.div`
  height: 100%;
  overflow: auto;
  border: solid 1px;
  border-radius: 5px;
  &::-webkit-scrollbar {
    display: none !important;
  }
  margin-bottom: 0.5rem;
`;

const PageWrap = styled.div`
  display: flex;
  justify-content: column;
`;

const PageButton = styled.button`
  background-color: white;
  color: ${props => (props.currentPage === props.buttonNumber ? "var(--color-primary)" : "black")};
  font-size: ${props => (props.currentPage === props.buttonNumber ? "var(--font-size-lg)" : "")};
`;
function TradeList() {
  const [data, setData] = useState([]);
  const [isSale, setIsSale] = useState(true);
  const [isBuy, setIsBuy] = useState(true);
  const [dayago, setDayago] = useState(1);
  const [page, setPage] = useState(1);
  const [user] = useContext(userContext);
  const [allpage, setAllpage] = useState(1);
  const [pagelist, setPagelist] = useState([]);

  const LIMIT = 6;
  function getData(sale, buy, day, page) {
    let url = apiUrl + logfilter;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userid: user.id,
        dayago: day,
        isSale: sale,
        isBuy: buy,
        page: page,
        limit: LIMIT
      })
    })
      .then(resultJson => {
        return resultJson.json();
      })
      .then(result => {
        let resultData = result[0].map(ele => {
          return {
            id: ele.id,
            title: ele.title,
            thumbnail: ele.thumbnailUrl,
            status: ele.seller.id === user.id ? "판매" : "구매",
            soldprice: ele.soldPrice,
            solddate: ele.soldDate,
            registdate: ele.registerDate,
            hopeprice: ele.hopePrice,
            deviation: (((ele.hopePrice - ele.soldPrice) / ele.soldPrice) * 100).toFixed(2),

            userId: user.id,
            targetId: ele.seller.id === user.id ? ele.buyerId : ele.seller.id,

            sellerCheck: ele.sellerCheck,
            buyerCheck: ele.buyerCheck
          };
        });
        setPageNumber(page++);
        setData(resultData);
        setAllpage(result[1] % LIMIT ? Math.floor(result[1] / LIMIT) + 1 : result[1] / LIMIT);
      });
  }

  function setPageNumber(num) {
    setPage(num);
  }
  function setSale() {
    setPage(1);
    setIsSale(!isSale);
  }

  function setBuy() {
    setPage(1);
    setIsBuy(!isBuy);
  }

  function setDay(day) {
    setPage(1);
    setDayago(day);
  }

  function changePage(pagenumber) {
    setPage(pagenumber);
  }
  useEffect(() => {
    if (user.id) getData(isSale, isBuy, dayago, page);
  }, [dayago, isBuy, isSale, user.id, page]);

  useEffect(() => {
    let slicepage = page > 5 ? page - 5 : 0; //5이상부터 페이지 자르기
    let pageLength = allpage - slicepage > 10 ? 10 : allpage - slicepage;
    setPagelist(
      Array.from({ length: pageLength }, (v, k) => {
        if (k < 10) return k + 1 + slicepage;
      })
    );
  }, [allpage, page]);
  return (
    <Wraper>
      <TradeWrap>
        <Header text="거래 내역" />

        <RightAlign>
          <ButtonSelect name="판매" select={() => setSale()} />
          <ButtonSelect name="구매" select={() => setBuy()} />
        </RightAlign>
        <LeftRightAlign>
          <PageWrap>
            {page > 1 && <button onClick={() => changePage(1)}>&lt;&lt;</button>}
            {pagelist.map(ele => (
              <PageButton
                buttonNumber={ele}
                currentPage={page}
                key={ele}
                onClick={() => changePage(ele)}
              >
                {ele}
              </PageButton>
            ))}
            {page < allpage && <button onClick={() => changePage(allpage)}>&gt;&gt;</button>}
          </PageWrap>
          <ButtonDays
            select_1d={() => setDay(1)}
            select_1w={() => setDay(7)}
            select_1y={() => setDay(365)}
            select_3y={() => setDay(365 * 3)}
          />
        </LeftRightAlign>
        <TradeContents>
          {data.map(value => (
            <TradeListBox key={value.title + value.solddate} {...value} />
          ))}
          {/* <InfiniteScroll
            reset={reset}
            fetcher={() => getData(isSale, isBuy, dayago, page)}
            drawer={drawer}
          /> */}
        </TradeContents>
      </TradeWrap>
      <Footer />
    </Wraper>
  );
}

export default TradeList;
