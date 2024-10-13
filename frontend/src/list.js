import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Button, TextField } from "@mui/material";
import { styled } from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_ITEM_MUTATION,
  GET_TODO_LIST,
  UPDATE_ITEM_MUTATION,
  DELETE_ITEM_MUTATION,
} from "./queries";
import { Cancel, Delete, Edit, Save } from "@mui/icons-material";
import { useState } from "react";
import { getOperationName } from "@apollo/client/utilities";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ContainerTop = styled.form`
  display: flex;
  background-color: #dcdcdc;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
`;

const ContainerList = styled.div`
  display: flex;
  width: 600px;
  background-color: #dcdcdc;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
`;
const ContainerListItem = styled.div`
  background-color: #efefef;
  padding: 10px;
  border-radius: 5px;
  max-height: 400px;
  overflow: auto;
`;

const ContainerButton = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 10px;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 28px;
`;

const EditContainer = styled.form`
  display: flex;
  width: 100%;
`;

export default function CheckboxList() {
  const [item, setItem] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const { data } = useQuery(GET_TODO_LIST);

  const [addItem] = useMutation(ADD_ITEM_MUTATION);
  const [updateItem] = useMutation(UPDATE_ITEM_MUTATION);
  const [deleteItem] = useMutation(DELETE_ITEM_MUTATION);

  const onSubmit = async (event) => {
    event.preventDefault();
    await addItem({
      variables: {
        values: {
          name: item,
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(GET_TODO_LIST)],
    });
    setItem("");
  };

  const onDelete = async (id) => {
    await deleteItem({
      variables: {
        id: id,
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(GET_TODO_LIST)],
    });
  };

  const startUpdate = (index, value) => {
    setEditingIndex(index);
    setEditingValue(value);
  };

  const onUpdate = async (id) => {
    await updateItem({
      variables: {
        values: {
          id: id,
          name: editingValue,
        },
      },
      awaitRefetchQueries: true,
      refetchQueries: [getOperationName(GET_TODO_LIST)],
    });

    setEditingIndex(null);
    setEditingValue("");
  };

  const onFilter = async (event) => {
    console.log(onFilter);
    // Aqui você irá implementar a chamada para o backend para fazer o filtro
  };

  return (
    <Container>
      <ContainerList>
        <Title>TODO LIST</Title>
        <ContainerTop onSubmit={onSubmit}>
          <TextField
            id="item"
            label="Digite aqui"
            value={item}
            type="text"
            variant="standard"
            onChange={(e) => setItem(e?.target?.value)}
          />
          <ContainerButton>
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              color="info"
              onClick={onFilter}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              color="success"
              type="submit"
            >
              Salvar
            </Button>
          </ContainerButton>
        </ContainerTop>
        <List sx={{ width: "100%" }}>
          <ContainerListItem>
            {data?.todoList?.map((value, index) => {
              return (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{
                    borderRadius: "5px",
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                >
                  <ListItemButton dense>
                    {editingIndex === index ? (
                      <EditContainer
                        onSubmit={(event) => {
                          event.preventDefault();
                          onUpdate(value.id);
                        }}
                      >
                        <TextField
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          variant="standard"
                          fullWidth
                        />
                        <Button type="submit" color="success">
                          <Save />
                        </Button>
                        <Button color="error">
                          <Cancel onClick={() => setEditingIndex(null)} />
                        </Button>
                      </EditContainer>
                    ) : (
                      <>
                        <ListItemText primary={value.name} />
                        <Button type="submit" color="info">
                          <Edit
                            onClick={() => startUpdate(index, value.name)}
                          />
                        </Button>
                        <Button color="error">
                          <Delete onClick={() => onDelete(value.id)} />
                        </Button>
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </ContainerListItem>
        </List>
      </ContainerList>
    </Container>
  );
}
