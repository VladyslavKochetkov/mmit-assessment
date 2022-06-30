import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";

const CarResults = ({ results }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [results]);

  if (!results) return null;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="text-center font-bold">Make ID</TableCell>
            <TableCell className="text-center font-bold">Make Name</TableCell>
            <TableCell className="text-center font-bold">Model ID</TableCell>
            <TableCell className="text-center font-bold">Model Name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((result) => (
              <TableRow key={result.Model_ID}>
                <TableCell>{result.Make_ID}</TableCell>
                <TableCell>{result.Make_Name}</TableCell>
                <TableCell>{result.Model_ID}</TableCell>
                <TableCell>{result.Model_Name}</TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          <TablePagination
            rowsPerPage={rowsPerPage}
            count={results.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={({ target: { value } }) => {
              setRowsPerPage(value);
              setPage(0);
            }}
          />
        </TableFooter>
      </Table>
    </TableContainer>
  );
};

export default CarResults;
