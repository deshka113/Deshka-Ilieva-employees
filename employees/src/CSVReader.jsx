import React, { useEffect, useState } from "react";

export const CSVReader = () => {
  const [csvFile, setCsvFile] = useState();
  const [employees, setEmployees] = useState([]);
  const [employeesPair, setEmployeesPair] = useState([]);
  const headerKeys = ["ProjecID#1", "EmployeeID#1", "EmployeeId#2", "Days"];
  const oneDay = 24 * 60 * 60 * 1000;
  
  useEffect(() => {
    const emplPair = empCombByPr(groupEmpByProj(employees));
    setEmployeesPair(emplPair);
  }, [employees]);

  const groupEmpByProj = (emp) => {
    return emp.reduce((acc, { EmpID, ProjectID, DateFrom, DateTo }) => {
      let startDay = new Date(DateFrom);
      let endDay = Date.parse(DateTo) ? new Date(DateTo) : new Date();
      let obj = { ProjectID: ProjectID, Employees: [] };
      let existPr = !acc.some((el) => el.ProjectID === obj.ProjectID)
        ? acc.push(obj)
        : null;
      acc.map((el) =>
        el.ProjectID === ProjectID
          ? el.Employees.push({ EmpID, startDay, endDay })
          : null
      );
      return acc;
    }, []);
  };

  const maxDays = (data) => {
    let maxDay = 0;
    let result = [];
    data.map((el) => {
      return el.map((elm) => {
        let max = elm.combinations.reduce((acm, currentEl) => {
          currentEl.map((x) =>
            x.days > maxDay
              ? ((maxDay = x.days),
                (result[0] = { ProjectID: elm.ProjectId, ...x }))
              : null
          );
          return acm;
        }, []);
        return max;
      });
    });
    return result;
  };

  const empCombByPr = (emp) => {
    let a = emp.reduce((acc, el) => {
      if (el.Employees.length > 1) {
        let combinations = el.Employees.reduce((arrComb, currentEm, index) => {
          let data = el.Employees.slice(index + 1).map((e) => {
            let result = [];
            if (
              (currentEm.endDay <= e.endDay && currentEm.enD > e.startDay) ||
              (e.endDay <= currentEm.endDay && e.endDay > currentEm.startDay) ||
              (currentEm.startDay > e.startDay &&
                currentEm.endDay < e.endDay) ||
              (currentEm.startDay < e.startDay && currentEm.endDay > e.endDay)
            ) {
              let firstDay =
                currentEm.startDay > e.startDay
                  ? currentEm.startDay
                  : e.startDay;

              let lastDay =
                currentEm.endDay < e.endDay ? currentEm.endDay : e.endDay;
              let days = Math.ceil((lastDay - firstDay) / oneDay);

              result.push({ emplA: currentEm.EmpID, emplB: e.EmpID, days });
            }
            return result;
          });
          if (data.length > 0) {
            arrComb.push(...data);
          }
          return arrComb;
        }, []);
        if (combinations) {
          acc.push([{ ProjectId: el.ProjectID, combinations }]);
        }
      }

      return acc;
    }, []);

    return maxDays(a);
  };

  const csvToArray = (csv) => {
    const csvHeader = csv.slice(0, csv.indexOf("\n")).split(",");

    const csvRows = csv
      .slice(csv.indexOf("\n") + 1, csv.length - 1)
      .split("\n");

    const arrayEmployees = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    setEmployees(arrayEmployees);
  };

  const handleImport = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (csvFile) {
      const file = csvFile;
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result;
        csvToArray(text);
      };
      reader.readAsText(file);
    }
  };





  return (
    <div>
      <form>
        <input type={"file"} accept={".csv"} onChange={handleImport} />
        <button
          onClick={handleSubmit}
        >
          Submit
        </button>
      </form>
      <br />

      {employeesPair.length > 0 ? (
        <table>
          <thead>
            <tr key={"header"}>
              {headerKeys.map((el, index) => (
                <th key={index}>{el}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {employeesPair.map((item) => (
              <tr key={item.ProjectID}>
                {Object.values(item).map((val, idex) => (
                  <td key={idex}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        "No data to display"
      )}
    </div>
  );
};
