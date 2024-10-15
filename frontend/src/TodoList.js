import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Button, TextField } from "@mui/material";
import { styled } from "styled-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_ITEM_MUTATION,
  GET_TODO_LIST,
  UPDATE_ITEM_MUTATION,
  DELETE_ITEM_MUTATION,
} from "./queries";
import {
  CancelOutlined,
  DeleteOutline,
  EditOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getOperationName } from "@apollo/client/utilities";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ContainerTop = styled.form`
  display: flex;
  background-color: white;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  border-radius: 5px;
`;

const ContainerList = styled.div`
  display: flex;
  width: 100%;
  max-width: 600px;
  background-color: white;
  flex-direction: column;

  padding: 10px;
  gap: 10px;
  border-radius: 5px;

  min-height: 80vh;

  @media (max-width: 600px) {
    height: 100vh;
  }
`;
const ContainerListItem = styled.div`
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  max-height: 400px;

  @media (min-width: 601px) {
    overflow: auto;
  }
`;

const ContainerButton = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 10px;
`;

const Title = styled.div`
  font-size: 28px;
  color: #ed6c02;
  padding: 20px;
`;

const EditContainer = styled.form`
  display: flex;
  width: 100%;
`;

const ListItemGroup = styled(ListItem)`
  min-height: 50px;

  button {
    display: none;
  }

  &:hover button {
    display: inline-flex;
  }

  border-bottom: 1px solid #e0e0e0;

  &:first-child {
    border-top: 1px solid #e0e0e0;
  }
`;

export default function TodoList() {
  const [item, setItem] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [fetchFilteredItems, { data }] = useLazyQuery(GET_TODO_LIST);

  const [addItem] = useMutation(ADD_ITEM_MUTATION);
  const [updateItem] = useMutation(UPDATE_ITEM_MUTATION);
  const [deleteItem] = useMutation(DELETE_ITEM_MUTATION);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!item.trim()) {
      return toast.error("Nome do item não pode estar em branco");
    }

    try {
      const response = await addItem({
        variables: {
          values: {
            name: item,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      toast.success(response.data.addItem.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onDelete = async (id) => {
    try {
      const response = await deleteItem({
        variables: {
          id: id,
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      toast.success(response.data.deleteItem.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const startUpdate = (id, value) => {
    setEditingId(id);
    setEditingValue(value);
  };

  const onUpdate = async (id) => {
    try {
      const response = await updateItem({
        variables: {
          values: {
            id: id,
            name: editingValue,
          },
        },
        awaitRefetchQueries: true,
        refetchQueries: [getOperationName(GET_TODO_LIST)],
      });
      toast.success(response.data.updateItem.message);
    } catch (error) {
      toast.error(error.message);
      if (error.graphQLErrors[0].extensions.code === "ITEM_ALREADY_EXISTS") {
        return;
      }
    }

    setEditingId(null);
    setEditingValue("");
  };

  const onFilter = async () => {
    fetchFilteredItems({
      variables: {
        filter: {
          name: item,
        },
      },
    });
  };

  useEffect(() => {
    fetchFilteredItems();
  }, []);

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
            color="warning"
          />
          <ContainerButton>
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              color="inherit"
              onClick={onFilter}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              sx={{ width: "100%" }}
              color="warning"
              type="submit"
            >
              Adicionar tarefa
            </Button>
          </ContainerButton>
        </ContainerTop>
        <List sx={{ width: "100%" }}>
          <ContainerListItem>
            {data?.todoList?.map((value) => {
              return (
                <ListItemGroup key={value.id} disablePadding>
                  <ListItemButton dense>
                    {editingId === value.id ? (
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
                          color="warning"
                          fullWidth
                        />
                        <Button type="submit" color="inherit">
                          <SaveOutlined />
                        </Button>
                        <Button color="inherit">
                          <CancelOutlined onClick={() => setEditingId(null)} />
                        </Button>
                      </EditContainer>
                    ) : (
                      <>
                        <ListItemText
                          primary={value.name}
                          sx={{ wordBreak: "break-word" }}
                        />
                        <Button type="submit" color="inherit">
                          <EditOutlined
                            onClick={() => startUpdate(value.id, value.name)}
                          />
                        </Button>
                        <Button color="inherit">
                          <DeleteOutline onClick={() => onDelete(value.id)} />
                        </Button>
                      </>
                    )}
                  </ListItemButton>
                </ListItemGroup>
              );
            })}
            {data?.todoList?.length === 0 && (
              <ListItemGroup>
                <ListItemText primary="Nenhum item encontrado" />
              </ListItemGroup>
            )}
          </ContainerListItem>
        </List>
      </ContainerList>
    </Container>
  );
}
